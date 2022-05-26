import styled from "styled-components";
import { primary, background, secondary, highlight, backgroundGradient, shadowEffect, highlightGradient } from "./theme";
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
  border: solid;
  border-width: 2px;
  color: ${background};
  padding: 6px 7px;
  cursor: pointer;
  &:hover {
    color: ${background};
    background-color: ${highlight};
    box-shadow: 10px -10px ${shadowEffect};

  }
  margin: 5px;
`;
export const MediumButtonInverted = styled.button`
  font-size: medium;
  transition: 0.3s;
  background-color: ${background};
  border-radius: 4px;
  border: none;
  border-width: 2px;
  color: ${primary};
  padding: 10px 10px;
  cursor: pointer;
  z-index:1;
  &:hover {
    color: ${background};
    background-color: ${highlight};
    background:${highlightGradient};
    box-shadow: 10px -10px ${shadowEffect};

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
  padding: 12px 12px;
  cursor: pointer;
  box-shadow: 0px 0px 15px -10px rgba(0,0,0,0.8)};
  background:${backgroundGradient};
  &:hover {
    color: ${background};
    background:${highlightGradient};
    background-color: ${highlight};
    box-shadow: 15px -12px ${shadowEffect};

  }
  margin: 5px;
`;
