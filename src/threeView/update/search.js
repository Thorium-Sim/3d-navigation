export default function searchUpdate(self, stars) {
  // Search for stars
  const { search } = self.props;
  const regex = new RegExp(search, "gi");
  const visibleStars = stars.filter(c => {
    if (c.name.match(regex) || !search) {
      return true;
    }
    return false;
  });
  stars.forEach(s => {
    s.visible = !search;
    const label = s.children.find(c => c.userData.isLabel);
    if (label) {
      label.visible = false;
    }
  });
  if (search) {
    visibleStars.forEach((s, i, arr) => {
      s.visible = true;
      const label = s.children.find(c => c.userData.isLabel);
      if (label) {
        if (arr.length <= 10) {
          label.visible = true;
        } else {
          label.visible = false;
        }
      }
    });
  }
}
