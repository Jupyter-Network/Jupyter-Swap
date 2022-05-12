import styled from 'styled-components';
import { primary,background, secondary, highlight,  } from './theme';
export const Input = styled.input`
font-size:medium;
  background-color:${background};
  border:none;
  border-bottom:solid;
  color:${primary};
  padding:5px 3px;
  text-align:end;
  outline:none;
  width:75%;
  transition: 0.4s;
  &:focus{
    color:${highlight};
    background-color:${background};
  }

  margin:5px;
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
  transition: 0.3s;
  width:50px;
  margin:5px auto;
  &:hover{
    color:${highlight};
    border-bottom:solid;
    border-width:1px;
    width:80%;

  }
`