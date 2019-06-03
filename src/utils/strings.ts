export function toTitleCase(text: string) {
  return text.replace(/_/g, " ").replace(/\w\S*/g, function(word) {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  });
}
