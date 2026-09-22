const GAMEBRAIN_URL="https://api.gamebrain.co/v1/games";

export default async (request)=>{
  try{
    const apiKey=process.env.GAMEBRAIN_API_KEY;
    if(!apiKey){
      return new Response(JSON.stringify({error:"GameBrain API key is not configured."}),{
        status:500,headers:{"Content-Type":"application/json"}
      });
    }

    const url=new URL(request.url);
    const search=url.searchParams.get("search")||"Minecraft";
    const apiUrl=new URL(GAMEBRAIN_URL);
    apiUrl.searchParams.set("query",search);

    const response=await fetch(apiUrl,{
      method:"GET",
      headers:{"x-api-key":apiKey,"Accept":"application/json"}
    });

    const text=await response.text();
    let data;
    try{data=JSON.parse(text)}catch{data={error:"GameBrain returned an invalid response."}}

    if(!response.ok){
      console.error("GameBrain error:",data);
      return new Response(JSON.stringify({
        error:data.error||data.message||"GameBrain request failed."
      }),{status:response.status,headers:{"Content-Type":"application/json"}});
    }

    return new Response(JSON.stringify(data),{
      status:200,
      headers:{
        "Content-Type":"application/json",
        "Cache-Control":"public, max-age=300"
      }
    });
  }catch(error){
    console.error("Server error:",error);
    return new Response(JSON.stringify({error:"Server error. Please try again."}),{
      status:500,headers:{"Content-Type":"application/json"}
    });
  }
};
