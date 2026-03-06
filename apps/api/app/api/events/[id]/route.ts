export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  void _request
  void (await params)
  return new Response('Not implemented', { status: 501 })
}

export async function PUT() {
  return new Response('Not implemented', { status: 501 })
}

export async function DELETE() {
  return new Response('Not implemented', { status: 501 })
}
