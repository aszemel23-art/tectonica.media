import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {articles} from '../content.mjs';import {readGalleryManifest} from './gallery-manifest.mjs';import {validatePublication} from './validate-publication.mjs';
const root=path.resolve(import.meta.dirname,'..'),manifest=readGalleryManifest();
const selected=articles.find(a=>a.date==='2026-09-17');
const change=patch=>articles.map(a=>a.id===selected.id?{...a,...patch}:a);
assert.throws(()=>validatePublication(change({image:''}),manifest,root),/cover and credit/);
assert.throws(()=>validatePublication(change({imageReview:null}),manifest,root),/missing complete source image review/);
const incomplete=structuredClone(manifest);incomplete.articles[selected.id].pop();
assert.throws(()=>validatePublication(articles,incomplete,root),/incomplete source gallery/);
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'tectonica-registry-'));const dir=path.join(fixture,'articles','unregistered');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),'<h1>Unregistered</h1>');
try{assert.throws(()=>validatePublication(articles,manifest,fixture),/Unregistered article HTML/);}finally{fs.unlinkSync(path.join(dir,'index.html'));fs.rmdirSync(dir);fs.rmdirSync(path.dirname(dir));fs.rmdirSync(fixture);}
console.log('PASS regression: missing cover, missing review, truncated gallery and direct HTML bypass are rejected');
