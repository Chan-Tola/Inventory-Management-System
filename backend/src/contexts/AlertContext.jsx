import { createContext } from "react";
import { GlobalAlert } from "../components/common/index";

// create Context
const AlertContext = createContext(null);

// create hook
export const useAlert = () => {
  return <div>AlertContext</div>;
};
    