import type { IdentifierType, ValidationResult } from "@/types/workspace"

export type { IdentifierType, ValidationResult }

export interface ValidateIdentifierInput {
  value: string | null | undefined
  type: IdentifierType
}
