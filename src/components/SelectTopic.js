import { Form } from "react-bootstrap";

export default function SelectTopic({ topic, setTopic, topicData }) {
  const onTopicChange = (event) => {
    setTopic(event.target.value);
  };

  return (
    <Form.Select
      style={{ width: "30%", borderRadius: "0.5rem" }}
      value={topic}
      onChange={onTopicChange}
      className="select-topic"
    >
      <option value="">Choose a topic</option>
      {topicData?.map((elem, index) => (
        <option key={index} value={elem.value}>
          {elem.label}
        </option>
      ))}
    </Form.Select>
  );
}
