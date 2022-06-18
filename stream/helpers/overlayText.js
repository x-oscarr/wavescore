// Overlay text for the stream
import safeStrings from "./safeStrings.js";

const getOverlayTextString = async (path, config, overlayConfig, metadata) => {
  // Create our overlay
  // Note: Positions and sizes are done relative to the input video width and height
  // Therefore position x/y is a percentage, like CSS style.
  // Font size is simply just a fraction of the width
  let overlayTextFilterString = '';
  if (overlayConfig && overlayConfig.enabled) {
    const overlayTextItems = [];

    const fontPath = `${path}${overlayConfig.font_path}`;

    // Check if we have a title option
    if (overlayConfig.title && overlayConfig.title.enabled) {
      const itemObject = overlayConfig.title;
      const safeText = safeStrings.forFilter(itemObject.text);
      let itemString =
        `drawtext=text='${safeText}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})`;
      if (itemObject.enable_scroll) {
        itemString += `:x=w-mod(max(t\\, 0) * (w + tw) / ${itemObject.font_scroll_speed}\\, (w + tw))`;
      } else {
        itemString += `:x=(w * ${itemObject.position_x / 100})`;
      }
      overlayTextItems.push(itemString);
    }

    // Check if we have an artist option
    if (overlayConfig.artist && overlayConfig.artist.enabled && metadata) {
      const itemObject = overlayConfig.artist;
      const safeText = safeStrings.forFilter(itemObject.label + metadata.artist);
      let itemString =
        `drawtext=text='${safeText}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`;
      overlayTextItems.push(itemString);
    }

    // Check if we have an album option
    if (overlayConfig.album && overlayConfig.album.enabled && metadata) {
      const itemObject = overlayConfig.album;
      const safeText = safeStrings.forFilter(itemObject.label + metadata.album);
      let itemString =
        `drawtext=text='${safeText}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`;
      overlayTextItems.push(itemString);
    }

    // Check if we have an artist option
    if (overlayConfig.song && overlayConfig.song.enabled && metadata) {
      const itemObject = overlayConfig.song;
      const safeText = safeStrings.forFilter(itemObject.label + metadata.title);
      let itemString =
        `drawtext=text='${safeText}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`;
      overlayTextItems.push(itemString);
    }

    // Add our video filter with all of our overlays
    overlayTextItems.forEach((item, index) => {
      overlayTextFilterString += `${item}`;
      if (index < overlayTextItems.length - 1) {
        overlayTextFilterString += ',';
      }
    });
  }

  // Return the filter string
  return overlayTextFilterString;
};

export default getOverlayTextString;
