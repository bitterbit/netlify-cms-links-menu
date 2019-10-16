import './bootstrap.js'
import CMS from 'netlify-cms'
import 'netlify-cms/dist/cms.css'
import { Control, Preview } from '../src'

// const config = {
//   backend: {
//     name: 'test-repo',
//     login: false,
//   },
//   media_folder: 'assets',
//   collections: [{
//     name: 'test',
//     label: 'Test',
//     folder: 'test/',
//     create: true,
//     fields: [
//       { name: 'title', label: 'Title', widget: 'string'},
//       { name: 'relation', label: 'Relation', widget: 'relation', collection: 'test', searchFields: ['title'], valueFields: ['title']},
//       { name: 'test_widget', label: 'Test Widget', widget: 'test'},
//     ],
//   },{
//     name: 'other',
//     label: 'Other', 
//     folder: 'other/',
//     create: true,
//     fields: [
//       { name: 'title', label: 'Title', widget: 'string'},
//     ]
//   }],
// }

CMS.registerWidget('test', Control, Preview)
// init();
// init({ config })
