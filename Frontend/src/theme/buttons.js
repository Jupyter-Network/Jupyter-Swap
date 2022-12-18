import styled from "styled-components";
import {
  primary,
  background,
  secondary,
  highlight,
  backgroundGradient,
  shadowEffect,
  highlightGradient,
} from "./theme";

const media = {
  mobile: "(any-hover:none)",
  desktop: "(any-hover:hover)",
};
export const SmallButton = styled.button`
  background-color: ${primary};
  transition: 0.2s;
  border-radius: 3px;
  border: none;
  color: ${background};
  padding: 5px 5px;
  cursor: pointer;
  &:hover {
    @media ${media.desktop} {
      color: ${background};
      background-color: ${highlight};
    }
  }
  &:active {
    color: ${background};
    background: ${highlightGradient};
    transform:scale(0.98);
  }
  margin: 5px;
  -webkit-tap-highlight-color: transparent;
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
  color: white;
  padding: 10px 10px;
  cursor: pointer;
  z-index: 1;
    @media ${media.mobile} {
      box-shadow: 1px 2px 2px rgba(25, 25, 25, 0.2);
      transition:0.1s;
  }
  &:hover {
    @media ${media.desktop} {
      color: ${background};
      background-color: ${highlight};
      background: ${highlightGradient};
      box-shadow: 5px -5px ${shadowEffect};
    }
  }
  &:active {
    color: ${primary};
    background: ${background};
    box-shadow: 1px 1px 1px rgba(25, 25, 25, 0.2);
    @media ${media.mobile} {
    transform:scale(0.95);

  }
  }
  }
  margin: 5px;
  -webkit-tap-highlight-color: transparent;
`;

export const LargeButton = styled.button`
  font-size: large;
  background-color: ${primary};
  transition: 0.2s;
  border-radius: 5px;
  border: none;
  color: ${background};
  padding: 12px 12px;
  cursor: pointer;
  box-shadow: 1px 1px 15px -10px rgba(0,0,0,0.8)};
  background:${backgroundGradient};
  &:hover {
    @media ${media.desktop}{
      color: ${background};
      background:${highlightGradient};
      background-color: ${highlight};
      box-shadow: 7px -6px ${shadowEffect}; 
    }
  }
  &:active{
    @media ${media.mobile}{
      background:${highlightGradient};
      color:${background};
    }
    transform:scale(0.95);

  }
  margin: 5px;
  -webkit-tap-highlight-color: transparent;

`;

export const SmallSecondaryButton = styled.button`
  background-color: ${background};
  border-radius: 3px;
  border: solid;
  border-width: 1px;
  color: ${secondary};
  padding: 5px 7px;
  cursor: pointer;
  box-shadow: 1px 2px 2px rgba(25, 25, 25, 0.2);

  &:hover {
    color: ${background};
    background: ${highlightGradient};
  }
  &:active {
    color: ${background};
    background: ${highlightGradient};
    box-shadow: 1px 1px 0px rgba(25, 25, 25, 0.2);
    transform: scale(0.95);
  }
  -webkit-tap-highlight-color: transparent;
  margin: 1px;
`;
