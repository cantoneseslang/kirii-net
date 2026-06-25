import type { EmployeeRecord } from "../types"

export type OrderOperator = {
  operatorMemberId: string
  operatorMemberName: string
}

export function resolveOrderOperator(
  authMemberId: string | null | undefined,
  targetMemberId: string,
  employees: EmployeeRecord[],
): OrderOperator {
  const operatorMemberId = String(authMemberId || targetMemberId)
  const employee = employees.find((row) => String(row.id) === operatorMemberId)
  const operatorMemberName =
    employee?.nameInChinese || employee?.nameInEnglish || operatorMemberId

  return { operatorMemberId, operatorMemberName }
}

export function isProxyOrder(
  order: { member_id: string; operator_member_id?: string | null },
): boolean {
  if (!order.operator_member_id) return false
  return String(order.operator_member_id) !== String(order.member_id)
}

export function formatOperatorSummary(
  operator: OrderOperator,
  targetMemberId: string,
  targetMemberName: string,
  actionLabel: string,
): string {
  if (!isProxyOrder({ member_id: targetMemberId, operator_member_id: operator.operatorMemberId })) {
    return actionLabel
  }
  return `${actionLabel}（操作者: ${operator.operatorMemberName} → 訂餐人: ${targetMemberName}）`
}
