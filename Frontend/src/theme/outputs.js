import styled from 'styled-components';
import { primary,background, secondary, highlight, backgroundGradient, highlightGradient } from './theme';
const borderWidth = "5px"
export const P = styled.span`
font-size:medium;
  color:${highlight};
  padding:5px 3px;
  text-align:center;
  outline:none;
  margin:5px;
`;

export const Label = styled.label`
font-size:medium;
  background-color:${background};
  color:${primary};
  padding:5px 3px;
  text-align:end;
  outline:none;
  width:fit-content;
  margin:7px;
  position:relative;
  top:-2px;
`;

export const ColorFrame = styled.div`
  position: relative;
  width:fit-content;
  padding:0px 10px;
  color:${highlight};
  margin:1px;
  font-size:medium;
&:before {
  content: "";
  position: absolute;
  inset: 0px;
  border-radius:7px;

  padding: 1px;
  background:${highlightGradient}; 
  -webkit-mask: 
     linear-gradient(#fff 0 0) content-box, 
     linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude; 
}

`

