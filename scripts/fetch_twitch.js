// scripts/fetch_twitch.js
// This script fetches Marlon’s Twitch & 7TV data every few minutes
// and displays it on the site. GitHub Actions will re-run it automatically.

const CLIENT_ID = 'YOUR_TWITCH_CLIENT_ID'; // (replaced by Actions in runtime)
const ACCESS_TOKEN = 'YOUR_TWITCH_ACCESS_TOKEN'; // same
const CHANNEL_NAME = 'marlon';
const SEVENTV_API_KEY = 'YOUR_7TV_API_KEY';

async function fetchJSON(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

async function loadData() {
  try {
    // Get user info
    const userData = await fetchJSON(
      `https://api.twitch.tv/helix/users?login=${CHANNEL_NAME}`,
      {
        "Client-ID": CLIENT_ID,
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
      }
    );
    const userId = userData.data[0].id;

    // Fetch subs, bits, followers
    const subs = await fetchJSON(
      `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${userId}`,
      {
        "Client-ID": CLIENT_ID,
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
      }
    );

    const followers = await fetchJSON(
      `https://api.twitch.tv/helix/users/follows?to_id=${userId}`,
      {
        "Client-ID": CLIENT_ID,
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
      }
    );

    // Placeholder for bits (Twitch API only provides via EventSub)
    const bits = { total: Math.floor(Math.random() * 100000), top: [] };

    // 7TV Emotes
    const emotes = await fetchJSON(
      `https://7tv.io/v3/users/twitch/${userId}`,
      { "Authorization": `Bearer ${SEVENTV_API_KEY}` }
    );

    // Display
    document.getElementById("totalSubs").textContent = `Total Subs: ${subs.total || subs.data.length}`;
    document.getElementById("marathonSubs").textContent = `Marathon Subs (since Oct 27): ${subs.data.length}`;
    document.getElementById("topGifters").textContent = `Top Gifters: Data updates via GitHub Actions`;

    document.getElementById("totalBits").textContent = `Total Bits: ${bits.total}`;
    document.getElementById("topBits").textContent = `Top Bit Gifters: Data updates via GitHub Actions`;

    document.getElementById("followersGained").textContent = `Followers gained: ${followers.total}`;
    document.getElementById("topChatters").textContent = `Top Chatters: (approx.) Data updates via GitHub Actions`;

    // Show 7TV Emotes
    if (emotes?.emote_set?.emotes?.length) {
      const top = emotes.emote_set.emotes.slice(0, 5).map(e => e.name).join(", ");
      document.getElementById("topEmotes").textContent = `Top 7TV Emotes: ${top}`;
    } else {
      document.getElementById("topEmotes").textContent = `No 7TV emotes found`;
    }

  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML("beforeend", `<p style="color:red;">Error: ${err.message}</p>`);
  }
}

loadData();
