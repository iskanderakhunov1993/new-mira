export const LEGAL_VERSION = "2026-07-22";
export const LEGAL_EFFECTIVE_DATE = "22 июля 2026 года";

export const legalOperator = {
  name: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_NAME?.trim() ?? "",
  email: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_EMAIL?.trim() ?? "",
  address: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_ADDRESS?.trim() ?? "",
};

export const legalOperatorIsConfigured = Boolean(
  legalOperator.name && legalOperator.email && legalOperator.address,
);
