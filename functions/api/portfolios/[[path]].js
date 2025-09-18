// 포트폴리오 API 메인 엔드포인트 (GET, POST 처리)
export default {
  async fetch(request, env, ctx) {
    const method = request.method;
    const url = new URL(request.url);
    const pathname = url.pathname;

  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGet(request, env, corsHeaders);
      case 'POST':
        return await handlePost(request, env, corsHeaders);
      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  }
}

// GET 요청 처리 - 모든 포트폴리오 조회
async function handleGet(request, env, corsHeaders) {
  
  // 쿼리 파라미터 처리
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const featured = url.searchParams.get('featured');
  const active = url.searchParams.get('active');
  
  let query = 'SELECT * FROM portfolios WHERE 1=1';
  const params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (featured === 'true') {
    query += ' AND is_featured = 1';
  }
  
  if (active !== 'false') { // 기본값은 활성 포트폴리오만
    query += ' AND is_active = 1';
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await env.DB.prepare(query).bind(...params).all();
  
  // image_urls를 JSON으로 파싱
  const portfolios = result.results.map(portfolio => ({
    ...portfolio,
    image_urls: portfolio.image_urls ? JSON.parse(portfolio.image_urls) : []
  }));
  
  return new Response(JSON.stringify({
    success: true,
    data: portfolios,
    count: portfolios.length
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// POST 요청 처리 - 새 포트폴리오 생성
async function handlePost(request, env, corsHeaders) {
  const body = await request.json();
  
  // 필수 필드 검증
  if (!body.title) {
    return new Response(JSON.stringify({ 
      error: 'Title is required' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // 데이터 준비
  const portfolioData = {
    title: body.title,
    description: body.description || null,
    category: body.category || null,
    client_name: body.client_name || null,
    main_image_url: body.main_image_url || null,
    image_urls: body.image_urls ? JSON.stringify(body.image_urls) : null,
    website_url: body.website_url || null,
    github_url: body.github_url || null,
    technologies_used: body.technologies_used || null,
    is_featured: body.is_featured ? 1 : 0,
    is_active: body.is_active !== false ? 1 : 0
  };
  
  const columns = Object.keys(portfolioData).join(', ');
  const placeholders = Object.keys(portfolioData).map(() => '?').join(', ');
  const values = Object.values(portfolioData);
  
  const query = `INSERT INTO portfolios (${columns}) VALUES (${placeholders})`;
  
  const result = await env.DB.prepare(query).bind(...values).run();
  
  // 생성된 포트폴리오 조회
  const newPortfolio = await env.DB.prepare(
    'SELECT * FROM portfolios WHERE id = ?'
  ).bind(result.meta.last_row_id).first();
  
  // image_urls 파싱
  if (newPortfolio.image_urls) {
    newPortfolio.image_urls = JSON.parse(newPortfolio.image_urls);
  } else {
    newPortfolio.image_urls = [];
  }
  
  return new Response(JSON.stringify({
    success: true,
    data: newPortfolio,
    message: '포트폴리오가 성공적으로 생성되었습니다.'
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
