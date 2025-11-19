// 헬스체크 엔드포인트
export default {
  async fetch(request, env, ctx) {
    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'nam-portfolio-api'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
}
