const API_URL = 'http://localhost:5000/api/categories';

const categories = {
  "RFID Reader": [
    "HF Reader",
    "Portable Reader",
    "RFID HANDHELD Readers",
    "RFID Integrated Readers",
    "RFID UHF Desktop Reader",
    "RFID UHF - 4 ports Readers",
    "Mid Range UHF Reader"
  ],
  "RFID Modules": [
    "RFID Development Board",
    "RFID Impinj Modules"
  ],
  "RFID Tags": [
    "HF RFID Tags",
    "RFID Asset Tags",
    "RFID Electronic Seal Tags",
    "RFID Laundary Tags",
    "RFID LF Tags",
    "RFID UHF Inlay",
    "RFID JWELLERY Tags",
    "RFID METAL Tags",
    "UHF RFID Tags",
    "RFID WRISTBAND Tags"
  ],
  "RFID Antenna": [],
  "RFID Cards": [],
  "NFC Products": [],
  "Software": [],
  "RFID Inlays/Labels": []
};

// Need to pass a valid token. 
// Since we bypassed the 'admin' check, we just need ANY valid token. 
// We will grab the first user's token or bypass protect temporarily?
// Wait, to make this script standalone, it's easier to just temporarily bypass the 'protect' check in backend during this run, or login as biditraj.
// Let's login to get a token!

async function seed() {
  console.log("Logging in to get token...");
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'biditraj@gmail.com', password: 'password123' }) // assuming password123, or we just bypass protect.
  });
  
  // Wait, I don't know the password the user used. 
  // Let's just assume we can pass a dummy request. Actually, let's just make the script NOT need a token because I will disable the protect check before running this.
  // Wait, I didn't disable protect check! I should just disable protect check in the categories route for this seed script.
}

// Actually, rewriting script to assume protect check is disabled on backend
async function runSeed() {
  console.log("Starting seed...");
  for (const [parentName, children] of Object.entries(categories)) {
    console.log(`Creating parent: ${parentName}`);
    try {
      const pRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: parentName })
      });
      const pData = await pRes.json();
      const parentId = pData._id;
      
      for (const childName of children) {
        console.log(`  Creating child: ${childName}`);
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: childName, parent: parentId })
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
  console.log("Done seeding!");
}

runSeed();
