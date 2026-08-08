using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HlumisaProperties.Application.Dtos;
using HlumisaProperties.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HlumisaProperties.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly JwtSettings _jwtSettings;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtSettings = jwtSettings.Value;
    }

    /// <summary>
    /// POST /api/auth/login — Authenticate and receive a JWT token.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required." });

        var user = await _userManager.FindByEmailAsync(request.Email.Trim());
        if (user == null)
            return Unauthorized(new { message = "Invalid email or password." });

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid email or password." });

        var token = await GenerateJwtTokenAsync(user);

        return Ok(new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureBase64 = user.ProfilePictureBase64,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
    }

    /// <summary>
    /// POST /api/auth/register — Create a new admin user (protected; only existing admins can register new users).
    /// </summary>
    [Authorize]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required." });

        if (request.Password.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        var existingUser = await _userManager.FindByEmailAsync(request.Email.Trim());
        if (existingUser != null)
            return Conflict(new { message = "A user with this email already exists." });

        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            EmailConfirmed = true,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
            return BadRequest(new { message = $"Failed to create user: {errors}" });
        }

        var token = await GenerateJwtTokenAsync(user);

        return Ok(new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureBase64 = user.ProfilePictureBase64,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
    }

    /// <summary>
    /// GET /api/auth/me — Returns the currently authenticated user's info.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserInfoResponse>> GetMe()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        return Ok(new UserInfoResponse
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureBase64 = user.ProfilePictureBase64
        });
    }

    /// <summary>
    /// PUT /api/auth/profile-picture — Update the authenticated user's profile picture.
    /// </summary>
    [Authorize]
    [HttpPut("profile-picture")]
    public async Task<ActionResult<UserInfoResponse>> UpdateProfilePicture([FromBody] UpdateProfilePictureRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ProfilePictureBase64))
            return BadRequest(new { message = "Profile picture data is required." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        user.ProfilePictureBase64 = request.ProfilePictureBase64;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = $"Failed to update profile picture: {errors}" });
        }

        return Ok(new UserInfoResponse
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureBase64 = user.ProfilePictureBase64
        });
    }

    private async Task<string> GenerateJwtTokenAsync(ApplicationUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.UserName!)
        };

        // Add roles if any
        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}