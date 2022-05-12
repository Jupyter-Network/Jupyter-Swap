import styled from "styled-components";
import { primary, background, secondary, highlight } from "./theme";
export const SmallButton = styled.button`
  background-color: ${primary};
  transition: 0.4s;
  border-radius: 3px;
  border: none;
  color: ${background};
  padding: 5px 5px;
  cursor: pointer;
  &:hover {
    color: ${background};
    background-color: ${highlight};
  }
  margin: 5px;
`;

export const MediumButton = styled.button`
  font-size: medium;
  transition: 0.3s;
  background-color: ${primary};
  border-radius: 4px;
  border: none;
  border-width: 2px;
  color: ${background};
  padding: 6px 7px;
  cursor: pointer;
  &:hover {
    color: ${background};
    background-color: ${highlight};
    box-shadow: 10px -10px teal;

  }
  margin: 5px;
`;

export const LargeButton = styled.button`
  font-size: large;
  background-color: ${primary};
  transition: 0.4s;
  border-radius: 5px;
  border: none;
  color: ${background};
  padding: 10px 12px;
  cursor: pointer;
  &:hover {
    color: ${background};
    background-color: ${highlight};
    box-shadow: 15px -12px teal;

  }
  margin: 5px;
`;
