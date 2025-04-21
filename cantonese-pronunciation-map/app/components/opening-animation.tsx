import Image from 'next/image';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1a1a1a;
`;

const IconImage = styled(Image)`
  animation: fadeInOut 2s ease-in-out forwards;
  
  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(1.2);
    }
  }
`;

export default function OpeningAnimation() {
  return (
    <Container>
      <IconImage
        src="/slang-sensei-icon.png"
        alt="Slang Sensei Icon"
        width={200}
        height={200}
        priority
      />
    </Container>
  );
} 