import { useProtectedFooterHook } from "../../../hook/layout/protected.hook";
import {
  shellFooter,
  shellFooterDot,
  shellFooterMeta,
  shellFooterNote,
} from "../../../styles/layout/shell.styles";

const ProtectedFooter = () => {
  const { year, branchLabel, online } = useProtectedFooterHook();

  return (
    <footer className={shellFooter}>
      <span className={shellFooterNote}>
        © {year} TARTAR ERP · Enterprise Suite
      </span>
      <div className={shellFooterMeta}>
        <span className={shellFooterNote}>{branchLabel}</span>
        <span className={shellFooterNote}>
          <span className={shellFooterDot({ online })} aria-hidden="true" />
          {online ? "Connected" : "Offline"}
        </span>
      </div>
    </footer>
  );
};

export default ProtectedFooter;
