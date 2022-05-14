import styled from 'styled-components';
import { primary,background, secondary, highlight } from './theme';
export const P = styled.span`
font-size:medium;
  background-color:${background};
  border-bottom:solid;
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
  margin:5px;
`;
