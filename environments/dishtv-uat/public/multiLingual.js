window.onload = function () {
  renderLangContent();
};
if (document.readyState === "complete") {
  renderLangContent();
}
function renderLangContent() {
  let urlParams = new URLSearchParams(location.search);
  let lang = urlParams.get("lang")?.toLowerCase();
  const tempInner = document.getElementsByClassName("temp_lang");
  for (let ele of tempInner) {
    ele.style.display = "none";
  }
  if (!!lang && document.getElementById(`lang_${lang}`)) {
    document.getElementById(`lang_${lang}`).style.display = "block";
  } else {
    document.getElementById(`lang_fre`).style.display = "block"; // change the id to default lang which needs to displayed
  }
}
