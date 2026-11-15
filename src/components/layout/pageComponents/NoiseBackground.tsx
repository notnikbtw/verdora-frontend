const NoiseBackground = () => (
  <div
    className="fixed inset-0 pointer-events-none z-0 opacity-10 mix-blend-multiply bg-repeat"
    style={{
      backgroundImage: `url(${import.meta.env.BASE_URL}noise.svg)`,
    }}
  />
);

export default NoiseBackground;
