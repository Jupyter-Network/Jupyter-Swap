import styled from 'styled-components';
import { primary,background, secondary, highlight, highlightGradient, tintedBackground,  } from './theme';
export const Input = styled.input`
font-size:medium;
  background-color:${tintedBackground};
  border:none;
  border-bottom:solid;
  color:${primary};
  padding: 10px 10px;
  text-align:end;
  outline:none;
  transition: 0.2s;
  border-bottom:none;
  width:100%;
  border-radius:10px;
  &:focus{
    color:${secondary};
    border: solid 1px;
  }
  margin:7px;
  font-size:1.01em;
`;

export const Select = styled.select`
font-size:medium;
  background-color:${primary};
  border-radius:4px;
  border:solid;
  color:${background};
  padding:5px 3px;
  text-align:end;
  outline:none;
  &:focus{
    color:${primary};
    background-color:${background};
  }
  margin:5px;
`;

export const ListOption = styled.p`
  cursor:pointer;
  transition: 0.2s;
  margin:5px auto;
  width:90%;
  &:hover{
    color:${background};
    padding:5px;
    background:${highlightGradient};
  }
  &:active{
    color:${highlight};

    background:${background};

  }
`