import { getDateForPage } from "logseq-dateutils";

export const completeTask = (): void => {
  logseq.App.registerCommandPalette(
    {
      key: "logseq-datenlp-plugin-completetask",
      label: "@Complete task",
      keybinding: {
        binding: "mod+shift+d",
      },
    },
    async () => {
      const currBlk = await logseq.Editor.getCurrentBlock();
      if (!currBlk) return;

      const markerArr: string[] = ["TODO", "NOW", "WAITING", "DOING", "LATER"];
      // Handle if task is already done, undo it. If task is not done, then
      // mark it as done.
      let { content } = currBlk;
      const preferredDateFormat: string = (await logseq.App.getUserConfigs())
        .preferredDateFormat;
      const date = getDateForPage(new Date(), preferredDateFormat!);

      if (currBlk.marker === "DONE") {
        content = content.replace(`[[${date}}]]`, "");
        content = content.replace("DONE", "TODO");
        await logseq.Editor.updateBlock(currBlk.uuid, content);
        await logseq.Editor.exitEditingMode();
      } else {
        // Add date
        // Replace TODO
        // Remove Scheduled and Deadline
        content = `${content} ${date}`;
        for (const m of markerArr) {
          // Replace TODO
          content = content.replace(m, "DONE");
        }
        if (
          content.includes("SCHEDULED: <") ||
          content.includes("DEADLINE: <" + " <")
        ) {
          content = content.substring(0, content.indexOf("SCHEDULED: <"));
          content = content.substring(0, content.indexOf("DEADLINE: <"));
        }
        await logseq.Editor.updateBlock(currBlk.uuid, content);
        await logseq.Editor.exitEditingMode();
      }
    },
  );
};
