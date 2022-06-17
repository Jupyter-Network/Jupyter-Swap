import styled, { keyframes } from "styled-components";
import {
  primary,
  background,
  secondary,
  highlight,
  backgroundGradient,
} from "./theme";
const rotete = keyframes`
  from {
    transform:rotate(0deg);
  }
  to {
    transform:rotate(-360deg);
    }
`;

export const LoaderObject = styled.object`
  transform-origin: center center;
  animation: ${rotete} 9s linear infinite;
`;
export const Rocket = styled.object`
  transform-origin: center center;
  animation: ${rotete} 9s linear reverse infinite;
`;
