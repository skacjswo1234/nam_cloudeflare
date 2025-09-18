// 메인 Workers 엔트리포인트
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // CORS 헤더 설정
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
      // 라우팅 처리
      if (pathname === '/api/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'nam-portfolio-api'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 포트폴리오 API 라우팅
      if (pathname.startsWith('/api/portfolios')) {
        return await handlePortfolioAPI(request, env, corsHeaders);
      }

      // 404 처리
      return new Response(JSON.stringify({ 
        error: 'Not found',
        path: pathname 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

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

// 포트폴리오 API 처리
async function handlePortfolioAPI(request, env, corsHeaders) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  // ID가 있는지 확인 (/api/portfolios/123 형태)
  const pathParts = pathname.split('/');
  const hasId = pathParts.length === 4 && pathParts[3]; // /api/portfolios/123

  if (hasId) {
    // 개별 포트폴리오 처리
    return await handleIndividualPortfolio(request, env, corsHeaders, pathParts[3]);
  } else {
    // 포트폴리오 목록 처리
    return await handlePortfolioList(request, env, corsHeaders);
  }
}

// 포트폴리오 목록 처리 (GET, POST)
async function handlePortfolioList(request, env, corsHeaders) {
  const method = request.method;

  switch (method) {
    case 'GET':
      return await getPortfolios(request, env, corsHeaders);
    case 'POST':
      return await createPortfolio(request, env, corsHeaders);
    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

// 개별 포트폴리오 처리 (GET, PUT, DELETE)
async function handleIndividualPortfolio(request, env, corsHeaders, id) {
  const method = request.method;

  // ID 유효성 검사
  if (!id || isNaN(parseInt(id))) {
    return new Response(JSON.stringify({ 
      error: 'Invalid portfolio ID' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  switch (method) {
    case 'GET':
      return await getPortfolio(request, env, corsHeaders, id);
    case 'PUT':
      return await updatePortfolio(request, env, corsHeaders, id);
    case 'DELETE':
      return await deletePortfolio(request, env, corsHeaders, id);
    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

// 모든 포트폴리오 조회
async function getPortfolios(request, env, corsHeaders) {
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
  
  if (active !== 'false') {
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

// 새 포트폴리오 생성
async function createPortfolio(request, env, corsHeaders) {
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

// 특정 포트폴리오 조회
async function getPortfolio(request, env, corsHeaders, id) {
  const portfolio = await env.DB.prepare(
    'SELECT * FROM portfolios WHERE id = ?'
  ).bind(id).first();
  
  if (!portfolio) {
    return new Response(JSON.stringify({ 
      error: '포트폴리오를 찾을 수 없습니다.' 
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // image_urls 파싱
  if (portfolio.image_urls) {
    portfolio.image_urls = JSON.parse(portfolio.image_urls);
  } else {
    portfolio.image_urls = [];
  }
  
  return new Response(JSON.stringify({
    success: true,
    data: portfolio
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 포트폴리오 수정
async function updatePortfolio(request, env, corsHeaders, id) {
  const body = await request.json();
  
  // 먼저 포트폴리오 존재 여부 확인
  const existingPortfolio = await env.DB.prepare(
    'SELECT id FROM portfolios WHERE id = ?'
  ).bind(id).first();
  
  if (!existingPortfolio) {
    return new Response(JSON.stringify({ 
      error: '포트폴리오를 찾을 수 없습니다.' 
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // 업데이트할 필드들 준비
  const updateFields = [];
  const values = [];
  
  if (body.title !== undefined) {
    updateFields.push('title = ?');
    values.push(body.title);
  }
  if (body.description !== undefined) {
    updateFields.push('description = ?');
    values.push(body.description);
  }
  if (body.category !== undefined) {
    updateFields.push('category = ?');
    values.push(body.category);
  }
  if (body.client_name !== undefined) {
    updateFields.push('client_name = ?');
    values.push(body.client_name);
  }
  if (body.main_image_url !== undefined) {
    updateFields.push('main_image_url = ?');
    values.push(body.main_image_url);
  }
  if (body.image_urls !== undefined) {
    updateFields.push('image_urls = ?');
    values.push(JSON.stringify(body.image_urls));
  }
  if (body.website_url !== undefined) {
    updateFields.push('website_url = ?');
    values.push(body.website_url);
  }
  if (body.github_url !== undefined) {
    updateFields.push('github_url = ?');
    values.push(body.github_url);
  }
  if (body.technologies_used !== undefined) {
    updateFields.push('technologies_used = ?');
    values.push(body.technologies_used);
  }
  if (body.is_featured !== undefined) {
    updateFields.push('is_featured = ?');
    values.push(body.is_featured ? 1 : 0);
  }
  if (body.is_active !== undefined) {
    updateFields.push('is_active = ?');
    values.push(body.is_active ? 1 : 0);
  }
  
  if (updateFields.length === 0) {
    return new Response(JSON.stringify({ 
      error: '업데이트할 필드가 없습니다.' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // updated_at 추가
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const query = `UPDATE portfolios SET ${updateFields.join(', ')} WHERE id = ?`;
  
  await env.DB.prepare(query).bind(...values).run();
  
  // 업데이트된 포트폴리오 조회
  const updatedPortfolio = await env.DB.prepare(
    'SELECT * FROM portfolios WHERE id = ?'
  ).bind(id).first();
  
  // image_urls 파싱
  if (updatedPortfolio.image_urls) {
    updatedPortfolio.image_urls = JSON.parse(updatedPortfolio.image_urls);
  } else {
    updatedPortfolio.image_urls = [];
  }
  
  return new Response(JSON.stringify({
    success: true,
    data: updatedPortfolio,
    message: '포트폴리오가 성공적으로 수정되었습니다.'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 포트폴리오 삭제
async function deletePortfolio(request, env, corsHeaders, id) {
  // 먼저 포트폴리오 존재 여부 확인
  const existingPortfolio = await env.DB.prepare(
    'SELECT id FROM portfolios WHERE id = ?'
  ).bind(id).first();
  
  if (!existingPortfolio) {
    return new Response(JSON.stringify({ 
      error: '포트폴리오를 찾을 수 없습니다.' 
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // 포트폴리오 삭제
  await env.DB.prepare('DELETE FROM portfolios WHERE id = ?').bind(id).run();
  
  return new Response(JSON.stringify({
    success: true,
    message: '포트폴리오가 성공적으로 삭제되었습니다.'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
