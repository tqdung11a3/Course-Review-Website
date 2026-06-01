export function CheckboxGroup({ options, values, onChange, columns = 1 }) {
  function toggle(value) {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  return (
    <div className={`checkbox-group ${columns === 2 ? "checkbox-group--grid" : ""}`}>
      {options.map((option) => (
        <label key={option.value} className="checkbox-item">
          <input
            type="checkbox"
            checked={values.includes(option.value)}
            onChange={() => toggle(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
