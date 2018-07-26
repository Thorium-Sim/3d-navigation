import leven from "leven";
import _ from "lodash/fp";

const similarityScore = (strA, strB) => {
  const aWords = strA.trim().split(" ");
  const bWords = strB.trim().split(" ");

  return _.flow(
    _.map(a => _.map(b => leven(a, b), bWords)),
    _.map(_.min),
    _.sum
  )(aWords);
};

export default function searchUpdate(self, stars) {
  // Search for stars
  const { search } = self.props;
  const visibleStars = stars.filter(c => {
    if (!search) return true;
    if (c.name.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
    if (similarityScore(search, c.name) <= 2) return true;
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
