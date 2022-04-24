import { EasyContainer, Title } from ".";
import SimpleInput from "./SimpleInput";

export default function Home() {
  return (
    <EasyContainer>
      <Title>Home</Title>
      <p>Homepage fill with content</p>
      <SimpleInput price={0.75}></SimpleInput>
    </EasyContainer>

  );
}
