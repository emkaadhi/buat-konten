export async function GET() {
  return Response.json({
    hasSecret: !!process.env.AUTH_SECRET,
    hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
    hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
    hasDbUrl: !!process.env.DATABASE_URL,
    secretLength: process.env.AUTH_SECRET?.length,
  });
}