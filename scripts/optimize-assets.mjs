import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = path.resolve('content/source-assets');
const outputRoot = path.resolve('public/assets/optimized');
await mkdir(outputRoot, { recursive: true });
const manifest = {};
const sourceFolders = ['', 'documents', 'dambulla'];
const slug = (value) => value
  .normalize('NFKD')
  .replace(/[^\w.-]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase();

for (const folder of sourceFolders) {
  for (const file of await readdir(path.join(sourceRoot, folder))) {
    if (!/\.(png|jpe?g)$/i.test(file)) continue;
    const input=path.join(sourceRoot,folder,file);
    const meta=await sharp(input).metadata();
    const key=(folder ? folder+'/' : '')+file;
    const prefix=folder === 'documents' ? 'doc-' : folder === 'dambulla' ? 'dambulla-' : '';
    const stem=prefix+slug(path.parse(file).name);
    const variants=[];
    const widths = key === 'hero-visitor-sigiriya.png' ? [640, 960, 1440, 1920] : [360, 720, 1200, 1600];
    for (const width of widths) {
      if (width > meta.width && width !== widths[0]) continue;
      const name=`${stem}-${width}.webp`;
      const quality = key === 'hero-visitor-sigiriya.png' ? 76 : 78;
      await sharp(input)
        .resize({width,withoutEnlargement:true})
        .webp({quality, effort: 5})
        .toFile(path.join(outputRoot,name));
      variants.push({src:'/assets/optimized/'+name,width:Math.min(width,meta.width)});
    }
    manifest[key]={width:meta.width,height:meta.height,variants};
  }
}
await writeFile('content/assets.json', JSON.stringify(manifest,null,2));
console.log(`Optimized ${Object.keys(manifest).length} source images from content/source-assets.`);
