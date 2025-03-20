// src/lib/arcgisToken.ts
export async function getArcGISToken(
    clientId: string,
    clientSecret: string,
    refererUrl: string
  ): Promise<string> {
    // 1) Acquire an OAuth 2.0 access_token
    const oauthUrl = 'https://arcgis.curtin.edu.au/portal/sharing/rest/oauth2/token';
  
    const params1 = new URLSearchParams();
    params1.append('grant_type', 'client_credentials');
    params1.append('client_id', clientId);
    params1.append('client_secret', clientSecret);
    params1.append('expiration', '1440'); // e.g., 1440 minutes (1 day)
  
    const resp1 = await fetch(oauthUrl, {
      method: 'POST',
      body: params1,
    });
    if (!resp1.ok) {
      throw new Error(`Failed to get access_token: ${resp1.status} ${resp1.statusText}`);
    }
    const data1 = await resp1.json();
    const accessToken = data1['access_token'];
    if (!accessToken) {
      throw new Error(`No access_token in first response: ${JSON.stringify(data1)}`);
    }
  
    // 2) Convert the access_token into an ArcGIS “token”
    const tokenUrl = 'https://arcgis.curtin.edu.au/portal/sharing/rest/generateToken';
  
    const params2 = new URLSearchParams();
    params2.append('request', 'getToken');
    params2.append('token', accessToken);
    params2.append('client', 'referer');
    params2.append('referer', refererUrl);
    params2.append('serverURL', 'https://arcgis.curtin.edu.au/portal');
    params2.append('f', 'json');
  
    const resp2 = await fetch(tokenUrl, {
      method: 'POST',
      body: params2,
    });
    if (!resp2.ok) {
      throw new Error(`Failed to get final token: ${resp2.status} ${resp2.statusText}`);
    }
    const data2 = await resp2.json();
    const myToken = data2['token'];
    if (!myToken) {
      throw new Error(`No token in final response: ${JSON.stringify(data2)}`);
    }
  
    return myToken;
  }
  