import type { LoyaltySettings } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type LoyaltyRule = {
  enabled: boolean;
  pointsPerCurrency: number;
  currencyPerPoint: number;
  minRedeemPoints: number;
  maxRedeemPercent: number;
};

export type LoyaltyRedeemResult = {
  redeemPoints: number;
  redeemValue: number;
  maxRedeemPoints: number;
};

const DEFAULT_RULES: LoyaltyRule = {
  enabled: true,
  pointsPerCurrency: 0.01,
  currencyPerPoint: 0.05,
  minRedeemPoints: 100,
  maxRedeemPercent: 50,
};

function toNumber(value: any, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function getLoyaltySettings(): Promise<LoyaltyRule> {
  const settings = await prisma.loyaltySettings.findFirst({ orderBy: { id: "asc" } });
  if (!settings) return DEFAULT_RULES;
  return normalizeSettings(settings);
}

export function normalizeSettings(settings: LoyaltySettings): LoyaltyRule {
  return {
    enabled: Boolean(settings.enabled),
    pointsPerCurrency: Math.max(0, toNumber(settings.pointsPerCurrency, DEFAULT_RULES.pointsPerCurrency)),
    currencyPerPoint: Math.max(0, toNumber(settings.currencyPerPoint, DEFAULT_RULES.currencyPerPoint)),
    minRedeemPoints: Math.max(0, Math.floor(toNumber(settings.minRedeemPoints, DEFAULT_RULES.minRedeemPoints))),
    maxRedeemPercent: Math.min(
      100,
      Math.max(0, Math.floor(toNumber(settings.maxRedeemPercent, DEFAULT_RULES.maxRedeemPercent)))
    ),
  };
}

export function computeEarnedPoints(amount: number, rule: LoyaltyRule) {
  if (!rule.enabled) return 0;
  const points = Math.floor(Math.max(0, amount) * rule.pointsPerCurrency);
  return Math.max(0, points);
}

export function computeRedeemablePoints(params: {
  availablePoints: number;
  subtotal: number;
  rule: LoyaltyRule;
}) {
  const availablePoints = Math.max(0, Math.floor(params.availablePoints));
  if (!params.rule.enabled) return 0;
  if (availablePoints < params.rule.minRedeemPoints) return 0;

  const maxValue = Math.max(0, (params.subtotal * params.rule.maxRedeemPercent) / 100);
  const maxPointsByValue =
    params.rule.currencyPerPoint > 0 ? Math.floor(maxValue / params.rule.currencyPerPoint) : 0;
  const maxRedeemPoints = Math.min(availablePoints, maxPointsByValue);

  if (maxRedeemPoints < params.rule.minRedeemPoints) return 0;
  return maxRedeemPoints;
}

export function computeRedeemValue(points: number, rule: LoyaltyRule) {
  const clean = Math.max(0, Math.floor(points));
  return Math.max(0, clean * rule.currencyPerPoint);
}

export function clampRedeem(params: {
  requestedPoints: number;
  availablePoints: number;
  subtotal: number;
  rule: LoyaltyRule;
}): LoyaltyRedeemResult {
  if (!params.rule.enabled) {
    return { redeemPoints: 0, redeemValue: 0, maxRedeemPoints: 0 };
  }

  const maxRedeemPoints = computeRedeemablePoints({
    availablePoints: params.availablePoints,
    subtotal: params.subtotal,
    rule: params.rule,
  });

  const requested = Math.max(0, Math.floor(params.requestedPoints));
  const redeemPoints = Math.min(requested, maxRedeemPoints);
  const redeemValue = computeRedeemValue(redeemPoints, params.rule);

  return { redeemPoints, redeemValue, maxRedeemPoints };
}
