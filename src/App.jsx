import PlaceCard from "./components/features/PlaceCard/PlaceCard";

function App() {
  return (
    <PlaceCard
      title="Example Place"
      description="This is an example place."
      location="Example Location"
      stars={4.5}
      reviews={100}
      imgTitle="Example Image"
    />
  );
}

export default App;