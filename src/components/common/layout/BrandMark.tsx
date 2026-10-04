type IProps = {
  className: string;
};

const brandMarkViewBox = "0 0 255.5 211.5";

const brandMarkPath =
  "M255.1 0.6 200.4 0.0 50.8 0.2 23.1 0.8 0.5 1.6 0.0 2.0 0.1 2.9 7.9 15.9 14.0 24.9 16.9 28.2 22.1 33.4 27.0 37.1 36.5 42.1 42.6 44.0 47.6 44.6 103.9 44.4 104.5 44.9 101.0 50.0 99.0 54.0 97.1 60.1 96.4 66.2 96.4 211.0 96.8 211.5 97.5 211.5 115.6 195.6 122.6 189.2 129.1 182.5 135.4 173.0 138.5 166.8 140.4 161.6 142.4 153.8 143.0 145.6 143.1 64.9 144.6 58.2 147.8 52.6 150.9 49.2 153.4 47.4 157.2 45.5 161.0 44.5 207.1 44.4 214.2 43.1 222.1 40.1 227.4 37.0 232.4 33.1 241.2 23.8 255.5 1.1Z";

const BrandMark = ({ className }: IProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={brandMarkViewBox}
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d={brandMarkPath} />
  </svg>
);

export default BrandMark;
