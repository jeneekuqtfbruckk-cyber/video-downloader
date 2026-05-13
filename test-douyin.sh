#!/bin/bash
node -e "fetch('http://localhost:3000/api/parse',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:'https://www.douyin.com/video/7258913772092296485'})}).then(r=>r.text()).then(console.log).catch(console.error)"
