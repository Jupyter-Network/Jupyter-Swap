import styled from "styled-components";
import { primary, background, secondary, highlight, backgroundGradient } from "./theme";

export const Container = styled.div`
  border-radius: 10px;
  background-color: ${background};
  color: ${primary};
  width: 97%;
  max-width: 400px;
  overflow: hidden;
  text-align: center;
  box-shadow: 0px 0px 7px -2px black;
  margin: 2px;
`;

export const ContainerTitle = styled.p`
  background-color: ${primary};
  color: ${background};
  margin-top: 0px;
  font-size: large;
  padding: 5px;
  text-align: start;
  background:${backgroundGradient};
`;
export const Table = styled.table`
  background-color: ${background};
`;

export const MainMenuItem = styled.div`
  color: ${primary};
  padding:10px;
  paddingTop:0px;
  height:10px;
 cursor:pointer;
  transition:0.3s;
line-height:0.1;
  border-bottom: solid transparent;
  z-index:100;
  &:hover {
    color: ${secondary};
    border-bottom: solid ${primary};
    height:20px;
  }
`;

export const GradientDiv = styled.div`
box-shadow:0px -2px  5px -4 black;

background:${backgroundGradient};
`

export const ContainerInverted = styled.div`
  color:${secondary};
  width:70%;
  margin:0 auto;
  padding:5px;
  text-align:left;
  border-radius:5px;
`
