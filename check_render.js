async function checkRender() {
  console.log('Checking Render deployment...');
  for (let i = 1; i <= 6; i++) {
    try {
      const res = await fetch('https://fit-track-4.onrender.com/');
      const html = await res.text();
      if (html.includes('index-Ca2rV0GG.js')) {
        console.log('✅ SUCCESS: Render has deployed the NEW bundle index-Ca2rV0GG.js with To-Do List!');
        return;
      } else {
        console.log(`Attempt ${i}: Render is still building container... waiting 10s`);
      }
    } catch (e) {
      console.log(`Attempt ${i}: Error -`, e.message);
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}

checkRender();
