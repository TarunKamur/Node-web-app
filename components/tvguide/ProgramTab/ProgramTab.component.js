import { useEffect, useRef } from "react";
import styles from "./ProgramTab.module.scss";

function ProgramTab({
  program,
  channel_left,
  setPaddingfromGuide,
  openProgram,
}) {
  const programRef = useRef(null);
  const program_text_Ref = useRef(null);

  useEffect(() => {
    if (programRef.current && program_text_Ref.current) {
      if (setPaddingfromGuide) {
        setPaddingfromGuide(setPaading);
      }
    }
  }, [channel_left]);

  function setPaading() {
    if (programRef.current && channel_left) {
      if (programRef.current.getBoundingClientRect().left < channel_left) {
        if (program_text_Ref.current) {
          program_text_Ref.current.style.paddingLeft = `${channel_left - programRef.current.getBoundingClientRect().left}px`;
        }
      } else {
        if (program_text_Ref.current) {
          program_text_Ref.current.style.paddingLeft = `0px`;
        }
      }
    }
  }

  return (
    <div
      onClick={() => openProgram(program)}
      className={`${
        styles.title_wrapper + " " + (program.id === -1 && styles.no_program)
      } ${parseInt(program?.display?.markers?.startTime?.value) < new Date().getTime() && parseInt(program?.display?.markers?.endTime?.value) > new Date().getTime() ? `${styles.active_program}` : ""}`}
      ref={programRef}
    >
      <p ref={program_text_Ref}>{program.display.title}</p>
    </div>
  );
}

export default ProgramTab;
