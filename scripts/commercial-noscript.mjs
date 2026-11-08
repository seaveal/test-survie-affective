import { readFileSync, writeFileSync } from 'node:fs'
const textes = JSON.parse(readFileSync(new URL('../src/commercial/textes.json', import.meta.url), 'utf8'))
if (process.env.VITE_RESULTATS_WHATSAPP === 'true') Object.assign(textes, JSON.parse(readFileSync(new URL('../src/commercial/textes-whatsapp.json', import.meta.url), 'utf8')))
for (const [file, id] of [['index.html','tsa-accueil'],['retrouvez-vous.html','bilan-accueil'],['retrouvez-vous/index.html','bilan-accueil'],['rdv/index.html','rdv-accueil']]) {
  const path = new URL('../dist/'+file, import.meta.url)
  let s = readFileSync(path,'utf8')
  const content = textes[id].replaceAll('<!--ACTION-->','<p>Activez JavaScript pour commencer.</p>')
  s = s.replace(/<noscript>[\s\S]*?<\/noscript>/, '<noscript>'+content+'</noscript>')
  const title = content.match(/<h1>(.*?)<\/h1>/)[1]
  s = s.replace(/<title>[\s\S]*?<\/title>/,'<title>'+title+' · Cyrille Novou</title>')
  writeFileSync(path,s)
}
// Same metadata in the initial HTML and in share previews.
for (const [file, id] of [['index.html','tsa-accueil'],['retrouvez-vous.html','bilan-accueil'],['retrouvez-vous/index.html','bilan-accueil'],['rdv/index.html','rdv-accueil']]) {
  const path = new URL('../dist/'+file, import.meta.url)
  let s = readFileSync(path,'utf8')
  const title = textes[id].match(/<h1>(.*?)<\/h1>/)[1]
  const paragraphs = [...textes[id].matchAll(/<p>(.*?)<\/p>/gs)].map(x=>x[1].replace(/<[^>]*>/g,''))
  let description = paragraphs.find(x=>x.length>100)
  if(description.length>220)description=description.slice(0,220).replace(/\s+\S*$/,'')+'…'
  const escape=x=>x.replaceAll('&','&amp;').replaceAll('"','&quot;')
  for(const [attr,key,value] of [['property','og:title',title],['name','twitter:title',title],['name','description',description],['property','og:description',description],['name','twitter:description',description]]) {
    s=s.replace(new RegExp('<meta\\s+'+attr+'="'+key+'"\\s+content="[^"]*"\\s*/?>'),'<meta '+attr+'="'+key+'" content="'+escape(value)+'">')
  }
  s=s.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,body)=>{
    const data=JSON.parse(body)
    for(const node of data['@graph']??[data])if(['WebPage','Quiz','Service'].includes(node['@type'])){node.name=title;node.description=description}
    return '<script type="application/ld+json">'+JSON.stringify(data).replaceAll('<','\\u003c')+'</script>'
  })
  writeFileSync(path,s)
}
