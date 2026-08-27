// A simple gray person-silhouette placeholder, encoded directly as an SVG data URI.
// Used whenever a staff/team member/leader has no photo uploaded yet.
// This never depends on the network (unlike an external placeholder image service),
// so it can never show up as a "broken image" icon.
const NO_PHOTO_PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%23bdbdbd'/%3E%3Cellipse cx='50' cy='88' rx='32' ry='24' fill='%23bdbdbd'/%3E%3C/svg%3E";

export default NO_PHOTO_PLACEHOLDER;
