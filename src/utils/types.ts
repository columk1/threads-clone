import type { NextResponse } from 'next/server'

// Generic type to get the response data from a Next.js API route
// Example: export type getData = ResponseData<typeof GET>
export type ResponseData<T> = T extends (...args: any[]) => Promise<NextResponse<infer U>> ? U : never

// Simpler version
// Example: export type getData = InferNextResponse<ReturnType<typeof GET>>
export type InferNextResponse<T> = T extends Promise<NextResponse<infer U>> ? U : never
