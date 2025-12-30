/**
 * Fetches a player's profile image from Wikipedia.
 * Uses the MediaWiki API to search for the player and get their page thumbnail.
 */
export const fetchPlayerImageFromWiki = async (playerName: string): Promise<string | undefined> => {
  if (!playerName || playerName === 'BATTER 1' || playerName === 'BATTER 2') return undefined;

  try {
    // 1. Search for the page (Append 'cricketer' to reduce ambiguity)
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      playerName + " cricketer"
    )}&format=json&origin=*`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.query.search.length === 0) return undefined;

    const pageTitle = searchData.query.search[0].title;

    // 2. Get the main image for that page
    const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      pageTitle
    )}&prop=pageimages&format=json&pithumbsize=500&origin=*`;

    const imageRes = await fetch(imageUrl);
    const imageData = await imageRes.json();

    const pages = imageData.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pages[pageId].thumbnail) {
      return pages[pageId].thumbnail.source;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching player image:", error);
    return undefined;
  }
};
