const tabs = await chrome.tabs.query({ lastFocusedWindow: true });
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));
const button = document.getElementById("group-button");
button.addEventListener("click", async () => {
  const domainDict = {};
  // 各タブのドメインごとに分類
  for (const tab of tabs) {
    const domain = new URL(tab.url).hostname;
    if (domainDict[domain] == undefined) {
      domainDict[domain] = [tab];
    } else {
      domainDict[domain].push(tab);
    }
  }
  // タブをドメインごとにグループ化
  for (const domain in domainDict) {
    const tabIds = domainDict[domain].map(({ id }) => id);
    // タブが1つの場合はグループ化を解除する
    if (tabIds.length <= 1) {
      if (tabIds[0] != undefined) {
        await chrome.tabs.ungroup(tabIds[0]);
      }
      continue;
    }
    const group = await chrome.tabs.group({ tabIds });
    let title = domain.split(".")[0].toUpperCase();
    // WWWの場合はドメインの2つ目をタイトルにする
    if (domain.split(".").length > 1 && title == "WWW") {
      title = domain.split(".")[1].toUpperCase();
    }
    // タイトルが長すぎる場合は省略
    if (title.length >= 5) {
      title = title.slice(0, 4);
    }
    await chrome.tabGroups.update(group, {
      title: title,
    });
  }
});
