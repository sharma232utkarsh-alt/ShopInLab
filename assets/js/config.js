/*
 * ===== ONE PLACE TO PLUG IN ADOBE TAGS =====
 * Paste your Tags (Launch) embed URL below — Development first, Production later.
 * Data Collection UI → Tags → your property → Environments → Install icon.
 * Leave empty to run the site with the data layer only.
 */
window.SHOPLAB_CONFIG = {
  tagsEmbedUrl: '' // e.g. 'https://assets.adobedtm.com/abc123/def456/launch-789-development.min.js'
};

// Data layer must exist before Tags loads
window.adobeDataLayer = window.adobeDataLayer || [];

(function loadTags(url) {
  if (!url) return;
  var s = document.createElement('script');
  s.src = url;
  s.async = true;
  document.head.appendChild(s);
})(window.SHOPLAB_CONFIG.tagsEmbedUrl);
