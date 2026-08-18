"use client";

import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";
import RequireZola from "@/components/RequireZola";
import { parseExcelFile } from "@/lib/excelParser";

type BookStatusColor = "white" | "red" | "green";

type BookEntry = {
  id: string;
  date: string;
  month: string;
  buyer: string;
  seller: string;
  originalAmount: number;
  amountPaid: number;       // label: "Due to Seller"
  deposit: number;
  lostDeed: number;
  commission: number;
  transferCosts: number;
  masterFees: number;
  balance: number;
  electricalCertificate: number;
  waterAccount: number;
  section118: number;
  erfNumber: string;
  area: string;
  outstandingBalance: number;
  statusColor: BookStatusColor;
};

/** Get today's date in South African timezone as YYYY-MM-DD */
function getTodaySA(): string {
  const now = new Date();
  const sa = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return sa.toISOString().split("T")[0];
}

/** Get the current month name in South African timezone */
function getCurrentMonthName(): string {
  const now = new Date();
  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
  ];
  const saMonthIndex = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    timeZone: "Africa/Johannesburg",
  }).format(now);
  return monthNames[parseInt(saMonthIndex, 10) - 1];
}

const initialData: BookEntry[] = [
  { id: "jan1", date: "", month: "JANUARY", buyer: "MASOKA", seller: "E/L MANCATA", originalAmount: 0, amountPaid: 140000, deposit: 0, lostDeed: 0, commission: 30000, transferCosts: 15000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "1588", area: "WELLS ESTATE", outstandingBalance: 0, statusColor: "white" },
  { id: "jan2", date: "", month: "JANUARY", buyer: "SWELINDAWO", seller: "SMILO", originalAmount: 0, amountPaid: 150000, deposit: 0, lostDeed: 0, commission: 15000, transferCosts: 15000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "jan3", date: "", month: "JANUARY", buyer: "KITSANA", seller: "NKABI", originalAmount: 0, amountPaid: 110000, deposit: 60000, lostDeed: 50000, commission: 0, transferCosts: 15000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "21755", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jan4", date: "", month: "JANUARY", buyer: "NONJAKAZI", seller: "SAM", originalAmount: 0, amountPaid: 195000, deposit: 0, lostDeed: 0, commission: 15000, transferCosts: 15000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "65696", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "jan5", date: "", month: "JANUARY", buyer: "NDABAMBI", seller: "E/L JOHNSON", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 21000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "18741", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jan6", date: "", month: "JANUARY", buyer: "MINI", seller: "MTATI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 15000, transferCosts: 15000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "31834", area: "KAMVELIHLE", outstandingBalance: 0, statusColor: "white" },
  { id: "jan7", date: "", month: "JANUARY", buyer: "PLAATJIES", seller: "E/L BINDA", originalAmount: 0, amountPaid: 160000, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 13500, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "27922", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jan8", date: "", month: "JANUARY", buyer: "GWATUDZI", seller: "SMILE", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 21500, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jan9", date: "", month: "JANUARY", buyer: "TOBI", seller: "MZOZOYANA", originalAmount: 0, amountPaid: 205600, deposit: 0, lostDeed: 0, commission: 30000, transferCosts: 15600, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "28514", area: "MOTHERWELL", outstandingBalance: 90000, statusColor: "white" },
  { id: "jan10", date: "", month: "JANUARY", buyer: "HEWANA", seller: "E/L MBUTUMA", originalAmount: 0, amountPaid: 24000, deposit: 0, lostDeed: 0, commission: 11000, transferCosts: 13000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "20342", area: "BETHELSDORP", outstandingBalance: 0, statusColor: "white" },
  { id: "jan11", date: "", month: "JANUARY", buyer: "MZAYIDUME", seller: "E/L MCOTOYI", originalAmount: 0, amountPaid: 140000, deposit: 0, lostDeed: 0, commission: 25000, transferCosts: 15000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "16429", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jan12", date: "", month: "JANUARY", buyer: "GONI", seller: "FANS", originalAmount: 0, amountPaid: 13000, deposit: 7000, lostDeed: 0, commission: 0, transferCosts: 13000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "7958", area: "BOOYSENS", outstandingBalance: 0, statusColor: "white" },
  { id: "jan13", date: "", month: "JANUARY", buyer: "NQWENISO", seller: "DAVIDS", originalAmount: 0, amountPaid: 163000, deposit: 0, lostDeed: 7800, commission: 30000, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "27114", area: "MOTHERWELL", outstandingBalance: 40000, statusColor: "white" },
  { id: "jan14", date: "", month: "JANUARY", buyer: "JOHNSON", seller: "JONAS", originalAmount: 0, amountPaid: 180000, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 15000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "30583", area: "MISSIONVALLE", outstandingBalance: 0, statusColor: "white" },
  { id: "jan15", date: "", month: "JANUARY", buyer: "GABAYI", seller: "E/L GANA", originalAmount: 0, amountPaid: 190000, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 15000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "", outstandingBalance: 0, statusColor: "white" },
  { id: "jan16", date: "", month: "JANUARY", buyer: "KWATSHA", seller: "MZOZOYANA", originalAmount: 0, amountPaid: 170000, deposit: 0, lostDeed: 7800, commission: 50000, transferCosts: 15000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "24014", area: "MOTHERWELL", outstandingBalance: 100000, statusColor: "white" },
  { id: "jan17", date: "", month: "JANUARY", buyer: "BOKOYI", seller: "MZOZOYANA", originalAmount: 0, amountPaid: 190000, deposit: 0, lostDeed: 7800, commission: 40000, transferCosts: 15000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "31553", area: "KAMVELIHLE", outstandingBalance: 44500, statusColor: "white" },
  { id: "jan18", date: "", month: "JANUARY", buyer: "PONO/KAWE", seller: "E/L CAKWE", originalAmount: 0, amountPaid: 170000, deposit: 0, lostDeed: 0, commission: 24000, transferCosts: 15000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jan19", date: "", month: "JANUARY", buyer: "ZEPE", seller: "MANELI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 40000, transferCosts: 0, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "BOND", area: "", outstandingBalance: 0, statusColor: "white" },
  { id: "jan20", date: "", month: "JANUARY", buyer: "SIDLABANE", seller: "E/L SKOSANA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 28500, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "", outstandingBalance: 0, statusColor: "white" },
  { id: "jan21", date: "", month: "JANUARY", buyer: "SIMANGO", seller: "SIMANGO", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 21500, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "19007", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "jan22", date: "", month: "JANUARY", buyer: "BEBE", seller: "E/L QOLANI", originalAmount: 0, amountPaid: 203000, deposit: 0, lostDeed: 0, commission: 14000, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "65033", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "feb1", date: "", month: "FEBRUARY", buyer: "KONA", seller: "LUBAMBO", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 13000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "7941", area: "DESPATCH", outstandingBalance: 0, statusColor: "white" },
  { id: "feb2", date: "", month: "FEBRUARY", buyer: "SAM", seller: "DLAKUDLA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 14000, transferCosts: 13000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "65696", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "feb3", date: "", month: "FEBRUARY", buyer: "MZOZOYANA", seller: "NTEYI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 75000, transferCosts: 0, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "5351", area: "WELLS ESTATE", outstandingBalance: 0, statusColor: "white" },
  { id: "feb4", date: "", month: "FEBRUARY", buyer: "SIWENDU", seller: "E/L MOSI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 10000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "22718", area: "KAMVELIHLE", outstandingBalance: 0, statusColor: "white" },
  { id: "feb5", date: "", month: "FEBRUARY", buyer: "MANELI", seller: "RALA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 100000, transferCosts: 0, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "27969", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "feb6", date: "", month: "FEBRUARY", buyer: "SIWENDU", seller: "MNYAMANA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "32937", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "feb7", date: "", month: "FEBRUARY", buyer: "SIYA", seller: "MAVATHA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 7800, commission: 6000, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "27281", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "feb8", date: "", month: "FEBRUARY", buyer: "NCULA", seller: "NOTSHOBA", originalAmount: 0, amountPaid: 160000, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 15000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "30801", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "feb9", date: "", month: "FEBRUARY", buyer: "NTSHOKO", seller: "E/L MPOZA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "32293", area: "KWANOBUHLE", outstandingBalance: 0, statusColor: "white" },
  { id: "mar1", date: "", month: "MARCH", buyer: "XHANTI", seller: "SODZEME", originalAmount: 0, amountPaid: 280000, deposit: 0, lostDeed: 0, commission: 70000, transferCosts: 20000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "3902", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "mar2", date: "", month: "MARCH", buyer: "XHANTI", seller: "LUKWE", originalAmount: 0, amountPaid: 200000, deposit: 0, lostDeed: 38000, commission: 25000, transferCosts: 18000, masterFees: 38000, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "4077", area: "IBHAYI", outstandingBalance: 170000, statusColor: "white" },
  { id: "mar3", date: "", month: "MARCH", buyer: "MPALALA", seller: "MPI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 15000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "33931", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "mar4", date: "", month: "MARCH", buyer: "MCAKUMBANA", seller: "FUBESI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "13067", area: "BOOYSENS PARK", outstandingBalance: 0, statusColor: "white" },
  { id: "mar5", date: "", month: "MARCH", buyer: "BILLY", seller: "MAVATA", originalAmount: 0, amountPaid: 195000, deposit: 0, lostDeed: 0, commission: 25000, transferCosts: 15000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "26739", area: "MOTHERWELL", outstandingBalance: 120000, statusColor: "white" },
  { id: "mar6", date: "", month: "MARCH", buyer: "TSILITE", seller: "NYAMAKAZI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 21000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "14797", area: "MOTHERWELL", outstandingBalance: 40000, statusColor: "white" },
  { id: "mar7", date: "", month: "MARCH", buyer: "MAFUXWANA", seller: "NXADI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 30000, transferCosts: 0, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "16850", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "mar8", date: "", month: "MARCH", buyer: "MLUNGWANA", seller: "KOTA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 14800, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "26420", area: "BETHELSDORP", outstandingBalance: 0, statusColor: "white" },
  { id: "mar9", date: "", month: "MARCH", buyer: "MPOFU", seller: "NALITI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "mar10", date: "", month: "MARCH", buyer: "MZOZOYANA", seller: "MJIJWA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 40000, transferCosts: 17000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 150000, statusColor: "white" },
  { id: "apr1", date: "", month: "APRIL", buyer: "MDABULA", seller: "MDABULA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 25000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "2835", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "apr2", date: "", month: "APRIL", buyer: "NYIKI", seller: "KLAAS", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "12169", area: "KWANOBUHLE", outstandingBalance: 0, statusColor: "white" },
  { id: "apr3", date: "", month: "APRIL", buyer: "MKHONTO", seller: "E/L YOKO", originalAmount: 0, amountPaid: 190000, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 16000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "24755", area: "MOTHERWELL", outstandingBalance: 106950, statusColor: "white" },
  { id: "apr4", date: "", month: "APRIL", buyer: "VANTYI", seller: "MAYISHE", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 30000, transferCosts: 0, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "9106", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "apr5", date: "", month: "APRIL", buyer: "FANTA", seller: "KHWALO", originalAmount: 0, amountPaid: 200000, deposit: 0, lostDeed: 0, commission: 20000, transferCosts: 15000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "apr6", date: "", month: "APRIL", buyer: "MZALAZALA", seller: "JOKANI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "16758", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "apr7", date: "", month: "APRIL", buyer: "MZOZOYANA", seller: "MAGABA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 5000, transferCosts: 13000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "", outstandingBalance: 0, statusColor: "white" },
  { id: "apr8", date: "", month: "APRIL", buyer: "NTONTELA", seller: "MATANJANA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 20000, transferCosts: 0, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "BOND", area: "", outstandingBalance: 0, statusColor: "white" },
  { id: "apr9", date: "", month: "APRIL", buyer: "MANELI", seller: "MANJEZI", originalAmount: 0, amountPaid: 195000, deposit: 0, lostDeed: 0, commission: 10000, transferCosts: 18000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "", outstandingBalance: 0, statusColor: "white" },
  { id: "apr10", date: "", month: "APRIL", buyer: "NGANGANI", seller: "NGANGANI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 10000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "", outstandingBalance: 0, statusColor: "white" },
  { id: "may1", date: "", month: "MAY", buyer: "FUZANI", seller: "E/L TORO", originalAmount: 0, amountPaid: 39000, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "25475", area: "KWANOBUHLE", outstandingBalance: 16220, statusColor: "white" },
  { id: "may2", date: "", month: "MAY", buyer: "MNYAMANA", seller: "E/L DESI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "28121", area: "KWANOBUHLE", outstandingBalance: 0, statusColor: "white" },
  { id: "may3", date: "", month: "MAY", buyer: "NTSINI", seller: "E/L TUSWA", originalAmount: 0, amountPaid: 153000, deposit: 0, lostDeed: 7800, commission: 15000, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "27040", area: "MOTHERWELL", outstandingBalance: 80000, statusColor: "white" },
  { id: "may4", date: "", month: "MAY", buyer: "ZWENI", seller: "E/L MAPU", originalAmount: 0, amountPaid: 60000, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 13000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "11679", area: "KWANOBUHLE", outstandingBalance: 34700, statusColor: "white" },
  { id: "may5", date: "", month: "MAY", buyer: "CHIEF SAI", seller: "", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 30000, transferCosts: 18000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "25600", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "may6", date: "", month: "MAY", buyer: "JELA", seller: "SIGUTYWA", originalAmount: 0, amountPaid: 150000, deposit: 0, lostDeed: 13000, commission: 0, transferCosts: 13000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "34863", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "may7", date: "", month: "MAY", buyer: "MZOZOYANA", seller: "NTENTENI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 40000, transferCosts: 18000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "may8", date: "", month: "MAY", buyer: "SNAM", seller: "E/L SLATER", originalAmount: 0, amountPaid: 225000, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 18000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "1357", area: "WELLS ESTATE", outstandingBalance: 100000, statusColor: "white" },
  { id: "may9", date: "", month: "MAY", buyer: "", seller: "PALAMENTE", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 18000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "27366", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "may10", date: "", month: "MAY", buyer: "MANGE", seller: "E/L TALAMBA", originalAmount: 0, amountPaid: 119701, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 20000, masterFees: 10520, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "9708", area: "KWANOBUHLE", outstandingBalance: 81381, statusColor: "white" },
  { id: "jun1", date: "", month: "JUNE", buyer: "MTSHAULANA", seller: "ZENZILE", originalAmount: 0, amountPaid: 83000, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 13000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "", outstandingBalance: 0, statusColor: "white" },
  { id: "jun2", date: "", month: "JUNE", buyer: "MJUZA", seller: "MAYEKISO", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 13000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "17993", area: "MISSIONVALE", outstandingBalance: 72200, statusColor: "white" },
  { id: "jun3", date: "", month: "JUNE", buyer: "MAFUNDA", seller: "DAYIMANI", originalAmount: 0, amountPaid: 180000, deposit: 0, lostDeed: 7800, commission: 0, transferCosts: 17000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "WELLS ESTATE", outstandingBalance: 92200, statusColor: "white" },
  { id: "jun4", date: "", month: "JUNE", buyer: "", seller: "BOOI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 0, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "jun5", date: "", month: "JUNE", buyer: "MZOZOYANA", seller: "NANGU", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 60000, transferCosts: 20000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jun6", date: "", month: "JUNE", buyer: "TSOTSO", seller: "", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 18000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "", outstandingBalance: 0, statusColor: "white" },
  { id: "jun7", date: "", month: "JUNE", buyer: "", seller: "THANDIWE", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 0, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "jun8", date: "", month: "JUNE", buyer: "MZOZOYANA", seller: "E/L TSHIRA", originalAmount: 0, amountPaid: 250000, deposit: 0, lostDeed: 0, commission: 50000, transferCosts: 20000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jun9", date: "", month: "JUNE", buyer: "", seller: "NGXANGANI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 30000, transferCosts: 18000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "jun10", date: "", month: "JUNE", buyer: "SIYA", seller: "BAKWANA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 0, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "BLOEMENDAL", outstandingBalance: 0, statusColor: "white" },
  { id: "jun11", date: "", month: "JUNE", buyer: "MANELI", seller: "JONAS", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 20000, transferCosts: 18000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "", outstandingBalance: 0, statusColor: "white" },
  { id: "jun12", date: "", month: "JUNE", buyer: "", seller: "KHASTA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 20000, transferCosts: 20000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "jun13", date: "", month: "JUNE", buyer: "JACK", seller: "T MAN", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 18000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "NKANDLA", outstandingBalance: 0, statusColor: "white" },
  { id: "jun14", date: "", month: "JUNE", buyer: "JOSEPH", seller: "MTATI", originalAmount: 0, amountPaid: 117000, deposit: 0, lostDeed: 50000, commission: 0, transferCosts: 17000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "BLOEMENDAL", outstandingBalance: 80000, statusColor: "white" },
  { id: "jun15", date: "", month: "JUNE", buyer: "MOODLEY", seller: "SAM", originalAmount: 0, amountPaid: 153000, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 13000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "UITENHAGE", outstandingBalance: 0, statusColor: "white" },
  { id: "jul1", date: "", month: "JULY", buyer: "MZOZOYANA", seller: "E/L NYODI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 40000, transferCosts: 18000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jul2", date: "", month: "JULY", buyer: "MAHLAKAHLAKA", seller: "NZUBE", originalAmount: 0, amountPaid: 94000, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 16000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "", outstandingBalance: 0, statusColor: "white" },
  { id: "jul3", date: "", month: "JULY", buyer: "MZOZOYANA", seller: "MPI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 150000, transferCosts: 17000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "33931", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jul4", date: "", month: "JULY", buyer: "MZOZOYANA", seller: "MTATI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 25000, transferCosts: 17000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jul5", date: "", month: "JULY", buyer: "MZOZOYANA", seller: "MPI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 0, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jul6", date: "", month: "JULY", buyer: "FRANCE", seller: "MAKHULU", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 60000, transferCosts: 0, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "BOND", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "jul7", date: "", month: "JULY", buyer: "ENTITY", seller: "SIMANGA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 12500, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "1743", area: "KWANOBUHLE", outstandingBalance: 25405, statusColor: "white" },
  { id: "jul8", date: "", month: "JULY", buyer: "LEVEL", seller: "VENA", originalAmount: 0, amountPaid: 0, deposit: 6000, lostDeed: 0, commission: 0, transferCosts: 7000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "38155", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "jul9", date: "", month: "JULY", buyer: "PAYI", seller: "", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 13000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "IBHAYI", outstandingBalance: 0, statusColor: "white" },
  { id: "jul10", date: "", month: "JULY", buyer: "MATYUNU", seller: "", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 13000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "KWANOBUHLE", outstandingBalance: 30000, statusColor: "white" },
  { id: "jul11", date: "", month: "JULY", buyer: "YOYO", seller: "E/L MANKEYA", originalAmount: 0, amountPaid: 180000, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 15000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "KWADWESI", outstandingBalance: 0, statusColor: "white" },
  { id: "jul12", date: "", month: "JULY", buyer: "CENENDA", seller: "BOOI", originalAmount: 0, amountPaid: 147200, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 14000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "IBHAYI", outstandingBalance: 27200, statusColor: "white" },
  { id: "aug1", date: "", month: "AUGUST", buyer: "KWATSHUBE", seller: "NGUMBELA", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 15000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "14848", area: "BLOEMENDAL", outstandingBalance: 0, statusColor: "white" },
  { id: "aug2", date: "", month: "AUGUST", buyer: "MZOZOYANA", seller: "E/L THEMBANI", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 25000, transferCosts: 20000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "33259", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
  { id: "aug3", date: "", month: "AUGUST", buyer: "MATI", seller: "", originalAmount: 0, amountPaid: 0, deposit: 0, lostDeed: 0, commission: 0, transferCosts: 20000, masterFees: 0, balance: 0, electricalCertificate: 0, waterAccount: 0, section118: 0, erfNumber: "", area: "MOTHERWELL", outstandingBalance: 0, statusColor: "white" },
];

type FieldType = "number" | "text" | "readonly";

const fieldConfig: Record<string, FieldType> = {
  date: "text",
  month: "readonly",
  buyer: "text",
  seller: "text",
  originalAmount: "number",
  amountPaid: "number",
  deposit: "number",
  lostDeed: "number",
  commission: "number",
  transferCosts: "number",
  masterFees: "number",
  balance: "number",
  electricalCertificate: "number",
  waterAccount: "number",
  section118: "number",
  erfNumber: "text",
  area: "text",
  outstandingBalance: "number",
};

/** Ordered keys for table columns — new layout as requested */
const columnOrder = [
  "date", "month", "buyer", "seller", "originalAmount", "amountPaid",
  "deposit", "lostDeed", "commission", "transferCosts", "masterFees",
  "electricalCertificate", "waterAccount", "section118",
  "outstandingBalance", "erfNumber", "area",
];

const fieldLabels: Record<string, string> = {
  date: "Date", month: "Month", buyer: "Buyer", seller: "Seller",
  originalAmount: "Original Amount", amountPaid: "Due to Seller",
  deposit: "Deposit", lostDeed: "Lost Deed", commission: "Commission",
  transferCosts: "Transfer Costs", masterFees: "Master Fees",
  electricalCertificate: "Elec Cert",
  waterAccount: "Water Account", section118: "Section 118",
  outstandingBalance: "Balance", erfNumber: "ERF", area: "Area",
};

/** Number columns that should be right-aligned */
const rightAlignedFields = new Set([
  "amountPaid", "deposit", "lostDeed", "commission", "transferCosts",
  "masterFees", "balance", "electricalCertificate", "waterAccount",
  "section118", "outstandingBalance", "originalAmount",
]);

function formatMoney(amount: number) {
  if (amount === 0) return "";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCellColorClass(color: BookStatusColor): string {
  switch (color) {
    case "red": return "text-rose-300";
    case "green": return "text-emerald-300";
    default: return "text-stone-200";
  }
}

function getCellBgClass(color: BookStatusColor): string {
  switch (color) {
    case "red": return "bg-rose-500/10";
    case "green": return "bg-emerald-500/10";
    default: return "";
  }
}

export default function BooksPage() {
  return (
    <RequireZola>
      <BooksContent />
    </RequireZola>
  );
}

function BooksContent() {
  const [data, setData] = useState<BookEntry[]>(initialData);
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [editCell, setEditCell] = useState<{ row: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [pendingFields, setPendingFields] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    initialData.forEach((row) => {
      if (row.lostDeed === 7800) initial[`${row.id}_lostDeed`] = true;
      if (row.outstandingBalance > 0) initial[`${row.id}_outstandingBalance`] = true;
      if (row.lostDeed === 50000) initial[`${row.id}_lostDeed`] = true;
    });
    return initial;
  });

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cellColors, setCellColors] = useState<Record<string, BookStatusColor>>(() => {
    const initial: Record<string, BookStatusColor> = {};
    initialData.forEach((row) => {
      if (row.outstandingBalance > 0) initial[`${row.id}_outstandingBalance`] = "red";
      if (row.lostDeed === 7800) initial[`${row.id}_lostDeed`] = "red";
      if (row.lostDeed === 50000) initial[`${row.id}_lostDeed`] = "red";
      if (row.commission > 39000) initial[`${row.id}_commission`] = "green";
    });
    return initial;
  });

  const [colorPickerCell, setColorPickerCell] = useState<{ row: string; field: string } | null>(null);
  const [colorPickerPos, setColorPickerPos] = useState<{ x: number; y: number } | null>(null);

  function cycleBookStatusColor(rowId: string) {
    setData((prev) =>
      prev.map((d) => {
        if (d.id !== rowId) return d;
        const next: Record<BookStatusColor, BookStatusColor> = { white: "red", red: "green", green: "white" };
        return { ...d, statusColor: next[d.statusColor] };
      })
    );
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const addEntryRef = useRef<HTMLDivElement>(null);

  const months = ["ALL", "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST"];

  const filtered = selectedMonth === "ALL" ? data : data.filter((d) => d.month === selectedMonth);

  const monthlyTotals: Record<string, { commission: number; transferCosts: number }> = {};
  data.forEach((d) => {
    if (!monthlyTotals[d.month]) monthlyTotals[d.month] = { commission: 0, transferCosts: 0 };
    monthlyTotals[d.month].commission += d.commission;
    monthlyTotals[d.month].transferCosts += d.transferCosts;
  });

  const handleCellClick = (row: BookEntry, field: string, e?: React.MouseEvent) => {
    const fType = fieldConfig[field] || "readonly";
    if (fType === "readonly") return;
    setColorPickerCell({ row: row.id, field });
    // Position the color picker next to the "Add new entry" button (left side)
    const addEntryEl = addEntryRef.current;
    if (addEntryEl) {
      const rect = addEntryEl.getBoundingClientRect();
      setColorPickerPos({ x: rect.left - 220, y: rect.top });
    } else {
      setColorPickerPos({ x: 20, y: window.innerHeight - 230 });
    }
  };

  const handleColorSelected = (color: BookStatusColor) => {
    if (!colorPickerCell) return;
    const key = `${colorPickerCell.row}_${colorPickerCell.field}`;
    setCellColors((prev) => ({ ...prev, [key]: color }));
    const row = data.find((d) => d.id === colorPickerCell.row);
    if (row) {
      const val = (row as any)[colorPickerCell.field];
      setEditCell({ row: colorPickerCell.row, field: colorPickerCell.field });
      setEditValue(val != null && val !== 0 ? String(val) : "");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
    setColorPickerCell(null);
  };

  const handleCellSave = useCallback(() => {
    if (!editCell) return;
    setData((prev) =>
      prev.map((d) => {
        if (d.id !== editCell.row) return d;
        const fType = fieldConfig[editCell.field] || "text";
        const updated = { ...d };
        if (fType === "number") {
          (updated as any)[editCell.field] = parseFloat(editValue) || 0;
        } else {
          (updated as any)[editCell.field] = editValue;
        }
        return updated;
      })
    );
    setEditCell(null);
  }, [editCell, editValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCellSave();
    if (e.key === "Escape") {
      setEditCell(null);
      setColorPickerCell(null);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const parsed = await parseExcelFile(file);
      if (parsed.length === 0) {
        setUploadResult("No valid rows found in the Excel file. Make sure the first row has headers like BUYER, SELLER, COMMISSION, etc.");
        return;
      }

      const monthMap: Record<string, string> = {
        "1": "JANUARY", "JAN": "JANUARY", "JANUARY": "JANUARY", "JAN.": "JANUARY",
        "2": "FEBRUARY", "FEB": "FEBRUARY", "FEBRUARY": "FEBRUARY", "FEB.": "FEBRUARY",
        "3": "MARCH", "MAR": "MARCH", "MARCH": "MARCH", "MAR.": "MARCH",
        "4": "APRIL", "APR": "APRIL", "APRIL": "APRIL", "APR.": "APRIL",
        "5": "MAY", "MAY": "MAY",
        "6": "JUNE", "JUN": "JUNE", "JUNE": "JUNE", "JUN.": "JUNE",
        "7": "JULY", "JUL": "JULY", "JULY": "JULY", "JUL.": "JULY",
        "8": "AUGUST", "AUG": "AUGUST", "AUGUST": "AUGUST", "AUG.": "AUGUST",
        "9": "SEPTEMBER", "SEP": "SEPTEMBER", "SEPTEMBER": "SEPTEMBER", "SEP.": "SEPTEMBER",
        "10": "OCTOBER", "OCT": "OCTOBER", "OCTOBER": "OCTOBER", "OCT.": "OCTOBER",
        "11": "NOVEMBER", "NOV": "NOVEMBER", "NOVEMBER": "NOVEMBER", "NOV.": "NOVEMBER",
        "12": "DECEMBER", "DEC": "DECEMBER", "DECEMBER": "DECEMBER", "DEC.": "DECEMBER",
      };

      const newEntries: BookEntry[] = parsed.map((row, idx) => {
        const rawMonth = (row.month || "").trim().toUpperCase();
        const normalizedMonth = monthMap[rawMonth] || monthMap[rawMonth.replace(/\.$/, "")] || rawMonth || (selectedMonth === "ALL" ? getCurrentMonthName() : selectedMonth);
        const id = `excel-${Date.now()}-${idx}`;
        return {
          id,
          date: row.date || getTodaySA(),
          month: normalizedMonth,
          buyer: row.buyer || "",
          seller: row.seller || "",
          originalAmount: row.originalAmount || 0,
          amountPaid: row.amountPaid || 0,
          deposit: row.deposit || 0,
          lostDeed: row.lostDeed || 0,
          commission: row.commission || 0,
          transferCosts: row.transferCosts || 0,
          masterFees: row.masterFees || 0,
          balance: row.balance || 0,
          electricalCertificate: row.electricalCertificate || 0,
          waterAccount: row.waterAccount || 0,
          section118: row.section118 || 0,
          erfNumber: row.erfNumber || "",
          area: row.area || "",
          outstandingBalance: row.outstandingBalance || row.balance || 0,
          statusColor: "white",
        };
      });

      setData((prev) => [...newEntries, ...prev]);
      setUploadResult(`✅ Successfully imported ${newEntries.length} row${newEntries.length !== 1 ? "s" : ""} from ${file.name}. The data has been auto-filled into the Books table.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadResult(`❌ Failed to parse Excel file: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAddRow = () => {
    const newId = `new-${Date.now()}`;
    const newEntry: BookEntry = {
      id: newId, date: getTodaySA(),
      month: selectedMonth === "ALL" ? getCurrentMonthName() : selectedMonth,
      buyer: "", seller: "", originalAmount: 0, amountPaid: 0,
      deposit: 0, lostDeed: 0, commission: 0, transferCosts: 0,
      masterFees: 0, balance: 0, electricalCertificate: 0,
      waterAccount: 0, section118: 0, erfNumber: "", area: "",
      outstandingBalance: 0, statusColor: "white",
    };
    setData((prev) => [...prev, newEntry]);
    setTimeout(() => {
      const el = document.getElementById(`book-row-${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedRow(newId);
        setTimeout(() => setHighlightedRow(null), 2500);
      }
    }, 100);
  };

  const handleRemoveRow = () => {
    if (!selectedRow) return;
    setData((prev) => prev.filter((d) => d.id !== selectedRow));
    setSelectedRow(null);
  };

  const handleRowDoubleClick = (rowId: string) => {
    setSelectedRow((prev) => (prev === rowId ? null : rowId));
  };

  const handleSaveAll = () => {
    setData((current) => {
      localStorage.setItem("hlumisa-books-data", JSON.stringify(current));
      return current;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalCommission = filtered.reduce((s, d) => s + d.commission, 0);
  const totalTransfer = filtered.reduce((s, d) => s + d.transferCosts, 0);
  const totalMasterFees = filtered.reduce((s, d) => s + d.masterFees, 0);
  const totalOutstanding = filtered.reduce((s, d) => s + d.outstandingBalance, 0);
  const totalOutstandingUnfiltered = data.reduce((s, d) => s + d.outstandingBalance, 0);
  const flippedCount = filtered.filter((d) => d.commission > 39000).length;

  const scrollToBookRow = (rowId: string) => {
    setSelectedMonth("ALL");
    setTimeout(() => {
      const el = document.getElementById(`book-row-${rowId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedRow(rowId);
        setTimeout(() => setHighlightedRow(null), 3000);
      }
    }, 150);
  };

  function renderCell(row: BookEntry, field: string) {
    const isEditing = editCell?.row === row.id && editCell?.field === field;
    const fType = fieldConfig[field] || "readonly";
    if (fType === "readonly") {
      const val = (row as any)[field];
      return <span className="text-stone-500">{(val as string) || "-"}</span>;
    }
    const val = (row as any)[field];
    const display = fType === "number" ? formatMoney(val as number) || "-" : (val as string) || "-";
    const isOutstanding = field === "outstandingBalance" && (val as number) > 0;
    const isCommissionHighlight = field === "commission" && (val as number) > 39000;
    const isLostDeedRed = field === "lostDeed" && (val as number) === 7800;
    const cellKey = `${row.id}_${field}`;
    const cellColor = cellColors[cellKey] || "white";
    const colorClass = getCellColorClass(cellColor);
    const bgClass = getCellBgClass(cellColor);

    if (isEditing) {
      return (
        <input ref={inputRef} type={fType === "number" ? "number" : "text"}
          value={editValue} onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellSave} onKeyDown={handleKeyDown}
          className="w-full min-w-[80px] rounded-lg border border-amber-200/40 bg-black/60 px-2 py-1 text-sm text-white outline-none" autoFocus />
      );
    }

    return (
      <span onClick={(e) => handleCellClick(row, field, e)}
        className={`cursor-pointer rounded px-1 py-0.5 transition hover:bg-amber-200/15 ${colorClass} ${bgClass} ${isOutstanding || isLostDeedRed ? "font-semibold" : ""} ${isCommissionHighlight ? "font-semibold" : ""}`}>
        {display}
        <span className="ml-1 opacity-0 group-hover:opacity-100 text-stone-500 text-xs">✎</span>
      </span>
    );
  }

  return (
    <div className="space-y-6" onDoubleClick={() => { if (selectedRow) setSelectedRow(null); }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Books</h1>
          <p className="mt-1 text-sm text-stone-400">Transaction ledger — all deals, commissions & balances.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none">
            {months.map((m) => (<option key={m} value={m}>{m === "ALL" ? "All Months" : m}</option>))}
          </select>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20">
            {uploading ? "⏳ Importing..." : "📊 Upload Excel"}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="hidden"
              onChange={handleExcelUpload}
            />
          </label>
          <button onClick={handleSaveAll}
            className="rounded-full bg-amber-200 px-6 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-100">
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Total Commission</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(totalCommission) || "R0"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Transfer Costs</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(totalTransfer) || "R0"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">🏠 Flipped Houses</p>
          <p className="mt-2 text-2xl font-semibold text-purple-200">{flippedCount}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Master Fees</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(totalMasterFees) || "R0"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-rose-300/20 bg-rose-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-300">💳 Pending Payments</p>
          <p className="mt-2 text-2xl font-semibold text-rose-200">{formatMoney(totalOutstanding) || "R0"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">📊 Outstanding Total</p>
          <p className="mt-2 text-2xl font-semibold text-amber-200">{formatMoney(totalOutstandingUnfiltered) || "R0"}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(monthlyTotals).map(([month, t]) => (
          <div key={month} className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xs">
            <span className="text-stone-400">{month}</span>
            <span className="ml-2 text-amber-200">C: {formatMoney(t.commission)}</span>
            <span className="ml-2 text-stone-400">T: {formatMoney(t.transferCosts)}</span>
          </div>
        ))}
      </div>

      {uploadResult && (
        <div className={`rounded-[1.5rem] border px-6 py-4 text-sm ${
          uploadResult.startsWith("✅")
            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
            : "border-rose-400/20 bg-rose-500/10 text-rose-200"
        }`}>
          {uploadResult}
        </div>
      )}

      {!uploadResult && (
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-6 py-4 text-xs leading-relaxed text-stone-500">
          <strong className="text-emerald-300">📊 Excel Upload:</strong> Upload an <strong>.xlsx</strong>, <strong>.xls</strong>, or <strong>.csv</strong> file and the data will <strong className="text-amber-200">auto-fill into the Books table</strong>. The first row must contain column headers such as <em>Buyer, Seller, Commission, Transfer Costs, Due to Seller, Balance, ERF, Area</em>, etc. Supported columns: Date, Month, Buyer, Seller, Original Amount, Due to Seller/Amount Paid, Deposit, Lost Deed, Commission, Transfer Costs, Master Fees, Elec Cert, Water Account, Section 118, Balance/Outstanding Balance, ERF, Area.
        </div>
      )}

      <div ref={tableRef} className="backdrop-card overflow-x-auto rounded-[2rem]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-stone-400">
              {columnOrder.map((key) => (
                <th key={key} className={`px-4 py-4 ${key === "outstandingBalance" ? "text-rose-300" : ""} ${rightAlignedFields.has(key) ? "text-right" : ""}`}>
                  {fieldLabels[key]}
                </th>
              ))}
              <th className="px-4 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => {
              const isFlipped = row.commission > 39000;
              const isHighlighted = highlightedRow === row.id;
              const isSelected = selectedRow === row.id;
              return (
                <tr key={row.id} id={`book-row-${row.id}`}
                  onDoubleClick={() => handleRowDoubleClick(row.id)}
                  className={`border-b border-white/5 transition cursor-pointer ${isSelected ? "bg-amber-400/20 ring-2 ring-amber-400/50" : isHighlighted ? "bg-amber-200/20 ring-2 ring-amber-300/40" : idx % 2 === 0 ? "bg-black/10 hover:bg-white/5" : "hover:bg-white/5"}`}>
                  {columnOrder.map((field) => (
                    <td key={field} className={`px-4 py-3 ${rightAlignedFields.has(field) ? "text-right" : ""}`}>
                      <span className="group">{renderCell(row, field)}</span>
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => cycleBookStatusColor(row.id)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition cursor-pointer hover:ring-2 hover:ring-white/20 ${row.statusColor === "green" ? "bg-emerald-500/20 text-emerald-200" : row.statusColor === "red" ? "bg-rose-500/20 text-rose-200" : "bg-white/5 text-stone-300"}`}>
                        {row.statusColor === "green" ? "✓ Done" : row.statusColor === "red" ? "✕ Declined" : "○ Pending"}
                      </button>
                      {isFlipped && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-200">🏠 Flipped</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={columnOrder.length + 1} className="px-4 py-8 text-center text-sm text-stone-500">No entries for this month.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {colorPickerCell && colorPickerPos && (
        <div
          className="fixed z-50 rounded-[2rem] border border-white/10 bg-[#12100e] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
          style={{ left: colorPickerPos.x, top: colorPickerPos.y }}
        >
          <div className="text-center">
            <p className="mb-3 text-sm text-stone-400">Color for <span className="text-amber-200 font-medium">{fieldLabels[colorPickerCell.field]}</span></p>
            <div className="flex justify-center gap-3">
              <button onClick={() => handleColorSelected("white")}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/60 bg-white text-xs font-bold uppercase tracking-wider text-stone-800 transition hover:scale-110 hover:border-white hover:bg-stone-100">W</button>
              <button onClick={() => handleColorSelected("red")}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-rose-400/70 bg-rose-600 text-xs font-bold uppercase tracking-wider text-white transition hover:scale-110 hover:border-rose-300 hover:bg-rose-500">R</button>
              <button onClick={() => handleColorSelected("green")}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-400/70 bg-emerald-600 text-xs font-bold uppercase tracking-wider text-white transition hover:scale-110 hover:border-emerald-300 hover:bg-emerald-500">G</button>
            </div>
            <button onClick={() => setColorPickerCell(null)}
              className="mt-3 rounded-full border border-white/10 px-4 py-1.5 text-xs text-stone-400 transition hover:text-white hover:bg-white/5">Cancel</button>
          </div>
        </div>
      )}

      <div ref={addEntryRef} className="flex justify-center gap-4">
        <button onClick={handleAddRow}
          className="flex items-center gap-2 rounded-full border-2 border-dashed border-white/20 px-8 py-4 text-base text-stone-400 transition hover:border-amber-200/40 hover:text-amber-200 hover:bg-amber-200/5">
          <span className="text-2xl font-light">+</span><span>Add new entry</span>
        </button>
        <button onClick={handleRemoveRow} disabled={!selectedRow}
          className={`flex items-center gap-2 rounded-full border-2 px-8 py-4 text-base transition ${selectedRow ? "border-rose-400/40 text-rose-300 hover:border-rose-300/60 hover:bg-rose-500/10 hover:text-rose-200" : "border-white/10 text-stone-600 cursor-not-allowed"}`}>
          <span className="text-2xl font-light">✕</span><span>Remove selected row</span>
        </button>
      </div>

      {flippedCount > 0 && (
        <div className="rounded-[2rem] border border-purple-300/20 bg-purple-500/5 p-6">
          <h2 className="text-lg font-semibold text-white">🏠 Flipped Houses (Commission {">"} R39,000)</h2>
          <p className="text-sm text-stone-400">These deals have commission amounts exceeding R39,000. Click a row to jump to it in the table above.</p>
          <div className="mt-4 space-y-2">
            {data.filter((d) => d.commission > 39000).map((d) => (
              <div key={d.id} onClick={() => scrollToBookRow(d.id)}
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-purple-300/10 bg-black/20 px-5 py-3 transition hover:border-amber-300/30 hover:bg-amber-200/10 hover:scale-[1.01]">
                <div><p className="text-sm font-medium text-white">{d.buyer} → {d.seller}</p><p className="text-xs text-stone-400">{d.month} · {d.area}</p></div>
                <span className="text-sm font-semibold text-purple-200">{formatMoney(d.commission)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Link href="/admin/books/understanding"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm text-stone-400 transition hover:border-amber-200/40 hover:text-amber-200">
          <span>📖</span><span>Books Understanding — learn how this page works</span>
        </Link>
      </div>

      <p className="text-center text-xs text-stone-600">
        Click any cell to edit. First pick a color (white/red/green), then type your value. Press Enter to save, Escape to cancel. Double-click a row to select it, then click "Remove selected row" to delete it. Hit "Save Changes" to persist to localStorage.
      </p>
    </div>
  );
}
