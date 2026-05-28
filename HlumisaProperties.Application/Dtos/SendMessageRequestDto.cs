using System;
using System.Collections.Generic;
using System.Text;

namespace HlumisaProperties.Application.Dtos
{
    public class SendMessageRequestDto
    {
        public string RecipientId { get; set; }
        public string Message { get; set; }
    }
}
