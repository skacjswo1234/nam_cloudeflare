// 특정 포트폴리오 조회, 수정, 삭제 처리
export default {
  async fetch(request, env, ctx) {
    // URL에서 ID 추출
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    const method = request.method;

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

  // ID 유효성 검사
  if (!id || isNaN(parseInt(id))) {
    return new Response(JSON.stringify({ 
      error: 'Invalid portfolio ID' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGet(request, env, corsHeaders, id);
      case 'PUT':
        return await handlePut(request, env, corsHeaders, id);
      case 'DELETE':
        return await handleDelete(request, env, corsHeaders, id);
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

// GET 요청 처리 - 특정 포트폴리오 조회
async function handleGet(request, env, corsHeaders, id) {
  
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

// PUT 요청 처리 - 포트폴리오 수정
async function handlePut(request, env, corsHeaders, id) {
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

// DELETE 요청 처리 - 포트폴리오 삭제
async function handleDelete(request, env, corsHeaders, id) {
  
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
