import styled from 'styled-components';
import { primary,background, secondary, highlight } from './theme';


export const Container = styled.div`
  border-radius:10px;
  background-color:${background};
  color:${primary};
  border:solid;
  width:97%;
  max-width:400px;
  overflow:hidden;
  text-align:center;
  box-shadow: 0px 0px 7px  -2px black;
  margin:1px;
`;

export const ContainerTitle = styled.p`
    background-color:${primary};
    color:${background};
    margin-top:0px;
    font-size:large;
    padding:5px;
    text-align:start;
`
export const Table = styled.table`
background-color:${background};
`