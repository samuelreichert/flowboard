import './Dropdown.css';

type DropdownProps = {
  isOpen: boolean;
  onSelectOption: (option: string) => void;
  options: string[];
};

const Dropdown = ({ isOpen, onSelectOption, options }: DropdownProps) => (
  <div className={`dropdown ${isOpen ? 'dropdown--open' : ''}`}>
    {options.map((option, i) => (
      <div
        className="dropdown__item"
        key={`${option}-${i}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelectOption(option);
        }}
      >
        {option}
      </div>
    ))}
  </div>
);

export default Dropdown;
